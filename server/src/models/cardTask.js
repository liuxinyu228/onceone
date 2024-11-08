// 评估任务模板对象
const connection = require('../config/db');
const { decrypt } = require('../utils/util');
const logger = require('../utils/log');
class cardTaskTemplate {
    // 根据工作分类 workClassification 查询所有的任务详情。
    static getAllTaskByType(taskType, callback) {
        let sql;
        let params;
        if (taskType === 'ALL') {
            sql = 'SELECT * FROM card_task_template';
            params = [];
        } else {
            sql = 'SELECT * FROM card_task_template WHERE work_classification = $1';
            params = [taskType];
        }
        connection.query(sql, params, callback);
    }

    // 新增任务
    static addTask(taskInfo) {
        const sql = `
            INSERT INTO card_task_template 
            (title, work_classification, description, guide, created_at, updated_at, taskcategory) 
            VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
            RETURNING id;
        `;
        const { title, work_classification, description, guide, taskcategory } = taskInfo;
        return connection.query(sql, [title, work_classification, description, guide, taskcategory]);
    }

    // 更新任务
    static updateTaskById(id, updatedTaskInfo, callback) {
        const sql = `
            UPDATE card_task_template 
            SET
                title = $1,  
                work_classification = $2,
                description = $3,
                guide = $4,
                updated_at = NOW(),
                taskcategory = $5
            WHERE 
                id = $6;  
        `;
        const { title, work_classification, description, guide, taskcategory } = updatedTaskInfo;
        connection.query(sql, [title, work_classification, description, guide, taskcategory, id], callback);
    }

    // 删除任务
    static deleteTaskById(id, callback) {
        const sql = 'DELETE FROM card_task_template WHERE id = $1'; // 使用 $1 作为参数占位符
        connection.query(sql, [id], callback);
    }
}

class cardTask {
    constructor(username, systemName, workClassification) {
        this.username = username;
        this.systemName = systemName;
        this.workClassification = workClassification;
    }

    static getUserWorkTasks(groupId, decryptedTaskInfo, callback) {
        let systemInfo;
        try {
            systemInfo = JSON.parse(decryptedTaskInfo);
            console.log("taskInfo:", systemInfo);
        } catch (error) {
            return callback(new Error('Failed to decrypt system information'));
        }

        const query = `
            SELECT 
                ct.id,
                ct.title,
                ct.status,
                ct.work_classification,
                ct.description,
                ct.guide,
                ct.reportcontent,
                ct.materialpath,
                ct.taskcategory,
                ct.riskvalue,
                ct.system_default_value,
                TO_CHAR(ct.created_at, 'YYYY-MM-DD HH24:MI') as created_at, 
                TO_CHAR(ct.updated_at, 'YYYY-MM-DD HH24:MI') as updated_at
            FROM 
                card_task ct
            JOIN 
                card_system cs ON ct.task_id = cs.task_id
            JOIN 
                user_businesssystem_map ubm ON cs.system_id = ubm.businessSystem_id
            JOIN 
                card_users cu ON ubm.user_businessSystem_list_id = cu.businessSystemListID
            WHERE 
                cu.group_id = $1
                AND cs.system_name = $2
                AND ct.work_classification = $3;
        `;

        connection.query(query, [groupId, systemInfo.system_name, systemInfo.work_classification], callback);
    }

    static updateTaskById(id, updatedTaskInfo, callback) {
        const sql = `
            UPDATE card_task 
            SET
                status = $1, 
                reportcontent = $2, 
                riskvalue = $3,
                updated_at = NOW()
            WHERE 
                id = $4; 
        `;
        const {
            status,
            reportcontent, 
            riskvalue
        } = updatedTaskInfo;

        logger.info(`/updateTask/:id updateTaskById: ${id} ${status} ${reportcontent} ${riskvalue}`);

        connection.query(sql, [
            status,
            reportcontent, 
            riskvalue,
            id
        ], callback);
    }

    static async addUserWorkTask(groupId, AddtaskInfoArray, encryptedTaskInfo, callback) {
        let systemInfo;
        try {
            systemInfo = JSON.parse(decrypt(encryptedTaskInfo));
            console.log("taskInfo:", systemInfo);
        } catch (error) {
            return callback(new Error('Failed to decrypt system information'));
        }

        const client = await connection.connect();
        try {
            await client.query('BEGIN'); // 开始事务

            const getTaskIdQuery = `
                SELECT DISTINCT ct.task_id
                FROM card_task ct
                JOIN card_system cs ON ct.task_id = cs.task_id
                JOIN user_businesssystem_map ubm ON cs.system_id = ubm.businessSystem_id
                JOIN card_users cu ON ubm.user_businessSystem_list_id = cu.businessSystemListID
                WHERE cu.group_id = $1
                AND cs.system_name = $2
                AND ct.work_classification = $3;
            `;

            const taskIdResult = await client.query(getTaskIdQuery, [groupId, systemInfo.system_name, systemInfo.work_classification]);
            if (taskIdResult.rows.length === 0) {
                throw new Error('No task_id found for the given parameters');
            }

            const taskId = taskIdResult.rows[0].task_id;

            const insertTaskQuery = `
                INSERT INTO card_task 
                (task_id, title, status, work_classification, description, guide, taskcategory, system_default_value) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, false)
                RETURNING id;
            `;

            const insertedIds = [];
            for (const taskInfo of AddtaskInfoArray) {
                const { title, status, description, guide, taskcategory } = taskInfo;
                const result = await client.query(insertTaskQuery, [taskId, title, status, systemInfo.work_classification, description, guide, taskcategory]);
                insertedIds.push(result.rows[0].id);
            }

            await client.query('COMMIT'); // 提交事务
            callback(null, insertedIds);
        } catch (err) {
            await client.query('ROLLBACK'); // 回滚事务
            callback(err);
        } finally {
            client.release();
        }
    }

    static getTaskByCategory(Category, callback) {
        const query = `
            SELECT id, title, description, status FROM card_task WHERE taskcategory = $1; 
        `;
        connection.query(query, [Category], callback);
    }
}

module.exports = { cardTaskTemplate, cardTask };
