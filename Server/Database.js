import OracleDB from "oracledb"
import path from "path/win32";
import bcrypt from "bcryptjs";


export default class Database{


    static async init(connstring, username, password){
        let libPath = path.join(process.cwd(), 'instantclient_19_25');
        // let libPath = '/app/instantclient_19_29';

        console.log("🔶 Init Oracle Client from:", libPath);

        try {
            if (!OracleDB.oracleClientVersion) {
                OracleDB.initOracleClient({ libDir: "/usr/lib/oracle/19.25/client64/lib" });
            }
        } catch (err) {
            console.error("❌ Oracle Client Init Failed. Check path:", libPath);
            console.error(err);
            throw err;
        }

        await OracleDB.createPool({
            user: username,
            password: password,
            connectString: connstring,
            poolMin: 1,
            poolMax: 10,
            poolTimeout: 300,
            poolPingInterval: 60
        });

        return this
    }

    static async connect() {
        try {
            const connection = await OracleDB.getConnection();
            this.connection = connection;
            console.log("✅ Connected to Oracle!");
        } catch (error) {
            console.log("Error connecting to Oracle!");   
        }
    }


    static async login(username, password){

        const result = await this.connection.execute(`SELECT * FROM users WHERE UPPER(username) = UPPER(:username)`, 
            {
                username:username
            },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT, fetchInfo: { "HASHED_PASSWORD": { type: OracleDB.STRING }} }
        )

        
        if(result.rows.length == 0) return null
        
        const rows = result.rows[0]
        
        const match = await bcrypt.compare(password, rows.HASHED_PASSWORD);

        if(!match) return null

        return rows;
    }

    static async register({username, password, firstName, lastName, role}){        
        await this.connection.execute(`INSERT INTO users (username, first_name, last_name, picture, hashed_password, role)
            VALUES (:username, :firstName, :lastName, null, :password, :role)`,    
        {
            username:username,
            firstName:firstName,
            lastName:lastName,
            password:password,
            role:role
        })
    }



    static async getIssues({creatorId, assigneeId, orderField = "report_id", orderType = "ASC", statusId, priorityId, text}){  
        const binds = {}

        if (creatorId) {
            binds.creatorId = creatorId;
        }

        if (assigneeId) {
            binds.assigneeId = assigneeId;
        }

        if (priorityId) {
            binds.priorityId = priorityId;
        }

        if (statusId) {
            binds.statusId = statusId;
        }

        if(text){
            binds.txt = text
        }
    
        const result = await this.connection.execute(`
            SELECT 
                r.report_id, 
                rh.title,
                p.priority_id AS priority_id,
                u1.username AS creator_name,
                u2.username AS assignee_name,
                rh.status_id,
                rh.creation_date,
                rh.description
            FROM reports r
            INNER JOIN users u1 ON r.user_id = u1.user_id
            INNER JOIN report_history rh ON r.report_id = rh.report_id
            INNER JOIN priorities p ON rh.priority_id = p.priority_id
            INNER JOIN users u2 ON rh.assignee_id = u2.user_id


            ${creatorId || assigneeId ? "WHERE (" : ""}
                ${creatorId ? " r.user_id = :creatorId " : ""}
                ${creatorId && assigneeId ? 
                    "AND" : ""}
                ${assigneeId ? " rh.assignee_id = :assigneeid " : ""}
            ${creatorId || assigneeId ? ")" : ""}

            ${text ? `AND (
                (UTL_MATCH.EDIT_DISTANCE_SIMILARITY(UPPER(rh.title), UPPER(:txt)) > 50 OR UPPER(rh.title) LIKE UPPER('%${text}%')) OR
                (UTL_MATCH.EDIT_DISTANCE_SIMILARITY(UPPER(rh.description), UPPER(:txt)) > 50 OR UPPER(rh.description) LIKE UPPER('%${text}%')))`
                :""
            }
            AND rh.creation_date = (
                SELECT MAX(creation_date)
                FROM report_history
                WHERE report_id = r.report_id
                ${statusId ? " AND rh.status_id = :statusId " : ""}
            ) 
            ${priorityId ? " AND rh.priority_id = :priorityId " : ""}
            ORDER BY ${orderField == "creator_id" || orderField == "report_id" ? `r.${orderField}` : `rh.${orderField}`} ${orderType}`,
            binds,
            { fetchInfo: { "DESCRIPTION": { type: OracleDB.STRING }, "TITLE" : { type: OracleDB.STRING }}, outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )
        
        const rows = result.rows
        
        return rows    
    }

    static async addIssue({creatorId, reportDescription, proirityId, reportTitle, assigneeId}){
        const result = await this.connection.execute(
            `INSERT INTO reports (creation_date, user_id)
            VALUES (SYSDATE, :creatorId) 
            RETURNING report_id INTO :new_id`,    
            {
                creatorId: creatorId,
                new_id: { type: OracleDB.NUMBER, dir: OracleDB.BIND_OUT }
            }
        );

        const generatedId = result.outBinds.new_id[0];

        await this.connection.execute(`INSERT INTO report_history (creation_date, report_id, status_id, user_id, description, priority_id, title, assignee_id)
            VALUES (SYSDATE, :reportId, 1, :editorId, :reportDescription, :proirityId, :reportTitle, :assigneeId)`,    
            {
                reportId:generatedId,
                editorId:creatorId,
                reportDescription:reportDescription,
                proirityId:proirityId,
                reportTitle:reportTitle,
                assigneeId: assigneeId
            }
        )
    }

    static async updateIssue({reportId, statusId, reportTitle, editorId, reportDescription, assigneeId, proirityId}){
        await this.connection.execute(`INSERT INTO report_history (creation_date, report_id, status_id, user_id, description, priority_id, title, assignee_id)
            VALUES (SYSDATE, :repordId, :statusId, :editorId, :reportDescription, :proirityId, :reportTitle, :assigneeId)`,    
            {
                repordId: reportId,
                statusId: statusId,
                reportTitle: reportTitle,
                editorId: editorId,
                reportDescription: reportDescription,
                assigneeId: assigneeId,
                proirityId: proirityId
            }
        )
    }

    static async deleteIssue({reportId}){
        await this.connection.execute(`DELETE FROM report_history WHERE report_id = :repordId`,    
            {
                repordId: reportId,
            }
        )

        await this.connection.execute(`DELETE FROM reports WHERE report_id = :repordId`,    
            {
                repordId: reportId,
            }
        )


    }



    static async getAllUsers(){
        const result = await this.connection.execute(`SELECT u.user_id, u.username, r.name FROM users u INNER JOIN roles r ON r.role_id = u.role`,
            [],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )

        return result.rows
    }


}