// 评估任务模板对象
const connection = require('../config/db');
const { decrypt } = require('../utils/util');

class cardTaskTemplate {
    // 根据工作分类 workClassification 查询所有的任务详情。
    static getAllTaskByType(taskType, callback) {
        let sql;
        let params;
        if (taskType === 'ALL') {
            sql = 'SELECT * FROM card_task_template';
            params = [];
        } else {
            sql = 'SELECT * FROM card_task_template where workClassification = ?';
            params = [taskType];
        }
        connection.query(sql, params, callback);
    }

    // 新增任务
    static addTask(taskInfo, callback) {
        const sql = `
            INSERT INTO card_task_template 
            (title, work_classification, description, guide, created_at, updated_at, taskCategory) 
            VALUES (?, ?, ?, ?, NOW(), NOW(), ?);
        `;
        const { title, work_classification, description, guide, taskCategory } = taskInfo;
        connection.query(sql, [title, work_classification, description, guide, taskCategory], callback);
    }

    // 更新任务
    static updateTaskById(id, updatedTaskInfo, callback) {
        const sql = `
            UPDATE card_task_template 
            SET
                title = ?,
                work_classification = ?,
                description = ?,
                guide = ?,
                updated_at = NOW(),
                taskCategory = ?
            WHERE 
                id = ?;
        `;
        const { title, work_classification, description, guide, taskCategory } = updatedTaskInfo;
        connection.query(sql, [title, work_classification, description, guide, taskCategory, id], callback);
    }

    // 删除任务
    static deleteTaskById(id, callback) {
        const sql = 'DELETE FROM card_task_template WHERE id = ?';
        connection.query(sql, [id], callback);
    }
}

class cardTask {
    constructor(username, systemName, workClassification) {
        this.username = username;
        this.systemName = systemName;
        this.workClassification = workClassification;
    }

    static getUserWorkTasks(groupId, encryptedTaskInfo, callback) {
        let systemInfo;
        try {
            systemInfo = JSON.parse(decrypt(encryptedTaskInfo));
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
                ct.reportContent,
                ct.materialPath,
                ct.taskCategory,
                DATE_FORMAT(ct.created_at, '%Y-%m-%d %H:%i') as created_at,
                DATE_FORMAT(ct.updated_at, '%Y-%m-%d %H:%i') as updated_at
            FROM 
                card_task ct
            JOIN 
                card_system cs ON ct.task_id = cs.task_id
            JOIN 
                user_businesssystem_map ubm ON cs.system_id = ubm.businessSystem_id
            JOIN 
                card_users cu ON ubm.user_businessSystem_list_id = cu.businessSystemListID
            WHERE 
                cu.group_id = ?
                AND cs.system_name = ?
                AND ct.work_classification = ?;
        `;

        connection.query(query, [groupId, systemInfo.system_name, systemInfo.work_classification], callback);
    }

    static updateTaskById(id, updatedTaskInfo, callback) {
        const sql = `
            UPDATE card_task 
            SET
                status = ? ,
                reportContent = ?, 
                riskValue = ?,
                updated_at = NOW()
            WHERE 
                id = ?;
        `;
        const {
            status,
            reportContent, 
            riskValue
        } = updatedTaskInfo;


        connection.query(sql, [
            status,
            reportContent, 
            riskValue,
            id
        ], callback);
    }

    static addUserWorkTask(groupId, AddtaskInfo, encryptedTaskInfo, callback) {
        let systemInfo;
        try {
            systemInfo = JSON.parse(decrypt(encryptedTaskInfo));
            console.log("taskInfo:", systemInfo);
        } catch (error) {
            return callback(new Error('Failed to decrypt system information'));
        }

        const getTaskIdQuery = `
            SELECT DISTINCT ct.task_id
            FROM card_task ct
            JOIN card_system cs ON ct.task_id = cs.task_id
            JOIN user_businesssystem_map ubm ON cs.system_id = ubm.businessSystem_id
            JOIN card_users cu ON ubm.user_businessSystem_list_id = cu.businessSystemListID
            WHERE cu.group_id = ?
            AND cs.system_name = ?
            AND ct.work_classification = ?;
        `;

        connection.query(getTaskIdQuery, [groupId, systemInfo.system_name, systemInfo.work_classification], (err, results) => {
            if (err) {
                return callback(err);
            }

            if (results.length === 0) {
                return callback(new Error('No task_id found for the given parameters'));
            }

            const taskId = results[0].task_id;

            const insertTaskQuery = `
                INSERT INTO card_task 
                (task_id, title, status, work_classification, description, guide, taskCategory) 
                VALUES (?, ?, ?, ?, ?, ?, ?);
            `;
            const { title, status, description, guide, taskCategory } = AddtaskInfo;
            connection.query(insertTaskQuery, [taskId, title, status, systemInfo.work_classification, description, guide, taskCategory], callback);
        });
    }

    static getTaskByCategory(Category,callback){
        const query = `
            SELECT id, title ,description ,status FROM card_task WHERE taskCategory = ?;
        `
        connection.query(query, [Category], callback);
    }
}

module.exports = { cardTaskTemplate, cardTask };
