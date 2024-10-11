const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const { v4: uuidv4 } = require('uuid');

// 新增接口：查询 persona_id 为 606 的用户下的所有评估系统
router.get('/getUserWorks', async (req, res) => {
    try {
        db.query(`
            SELECT 
                card_system.system_id,
                card_system.system_name, 
                card_system.superintendent_name,
                card_system.superintendent_phone,
                card_system.superintendent_email,
                card_users.username, 
                card_users.id as user_id,
                DATE_FORMAT(card_system.end_at, '%Y-%m-%d') AS end_at, 
                card_system.work_classification, 
                JSON_ARRAYAGG(JSON_OBJECT('id', card_task.id, 'status', card_task.status)) AS tasks
            FROM 
                card_users
            JOIN 
                user_businesssystem_map ON card_users.businessSystemListID = user_businesssystem_map.user_businessSystem_list_id
            JOIN 
                card_system ON user_businesssystem_map.businessSystem_id = card_system.system_id
            LEFT JOIN 
                card_task ON card_system.task_id = card_task.task_id
            WHERE 
                card_users.persona_id = 606
            GROUP BY 
                card_system.system_name, card_users.username, card_system.end_at, card_system.work_classification
        `, (error, results) => {
            if (error) {
                console.error('Error fetching evaluations:', error);
                return res.status(500).json({ status: false, message: 'Server Error' });
            }

            console.log("Query result:", JSON.stringify(results, null, 2));
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ status: false, message: 'Server Error' });
    }
});

// 新增接口：返回 persona_id 为 606 的用户的用户名, 接口名称为 getWorkers
router.get('/getWorkers', async (req, res) => {
    try {
        db.query(`
            SELECT 
                id,username,group_id
            FROM 
                card_users 
            WHERE 
                persona_id = 606
        `, (error, results) => {
            if (error) {
                console.error('Error fetching usernames:', error);
                return res.status(500).json({ status: false, message: 'Server Error' });
            }

            res.json({ status: true, data: results });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ status: false, message: 'Server Error' });
    }
});

// 新增接口：从管理员侧为用户新增评估系统
router.post('/addUserWork', (req, res) => {
    const { username, groupId, businessSystemName, superintendentName, superintendentPhone, superintendentEmail, workClassification, endAt } = req.body;

    // 先查询是否存在同名同任务类型的评估任务
    const checkQuery = `
        SELECT * FROM card_task ct
        JOIN card_system cs ON ct.task_id = cs.task_id
        JOIN user_businesssystem_map ubm ON cs.system_id = ubm.businessSystem_id
        JOIN card_users cu ON ubm.user_businessSystem_list_id = cu.businessSystemListID
        WHERE ubm.group_id = ? AND cs.system_name = ? AND ct.work_classification = ?;
    `;

    db.query(checkQuery, [groupId, businessSystemName, workClassification], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Evaluation system with the same name and task type already exists in the group' });
        }

        const taskId = uuidv4();

        // 在 card_system 中创建评估系统记录
        const insertSystemQuery = `
            INSERT INTO card_system (system_name, superintendent_name, superintendent_phone, superintendent_email, work_classification, task_id, end_at)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        db.query(insertSystemQuery, [businessSystemName, superintendentName, superintendentPhone, superintendentEmail, workClassification, taskId, endAt], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const systemId = result.insertId;

            // 将创建的评估系统记录与 card_users 中对应的用户进行关联
            const insertUserSystemMapQuery = `
                INSERT INTO user_businesssystem_map (user_businessSystem_list_id, businessSystem_id, group_id)
                SELECT 
                    CASE 
                        WHEN businessSystemListID IS NULL THEN ? 
                        ELSE businessSystemListID 
                    END, 
                    ? ,
                    ?
                FROM card_users 
                WHERE username = ?;
            `;

            const newBusinessSystemListID = uuidv4();

            db.query(insertUserSystemMapQuery, [newBusinessSystemListID, systemId, groupId, username], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // 更新 card_users 表中的 businessSystemListID 字段
                const updateUserBusinessSystemListIDQuery = `
                    UPDATE card_users
                    SET businessSystemListID = ?
                    WHERE username = ? AND businessSystemListID IS NULL;
                `;

                db.query(updateUserBusinessSystemListIDQuery, [newBusinessSystemListID, username], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    // 根据 workClassification 参数的值在 card_task_template 表中查询出对应的任务
                    const selectTaskTemplateQuery = `
                        SELECT * FROM card_task_template WHERE work_classification = ?;
                    `;

                    db.query(selectTaskTemplateQuery, [workClassification], (err, taskTemplates) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        // 在 card_task 表中新增对应记录，并关联 task_id
                        const insertTaskQuery = `
                            INSERT INTO card_task (status, title, work_classification, description, guide, reportContent, materialPath, taskCategory, created_at, updated_at, task_id)
                            VALUES ?;
                        `;

                        const taskValues = taskTemplates.map(task => [
                            '进行中',
                            task.title,
                            task.work_classification,
                            task.description,
                            task.guide,
                            task.reportContent,
                            task.materialPath,
                            task.taskCategory,
                            new Date(),
                            new Date(),
                            taskId // 关联 task_id
                        ]);

                        db.query(insertTaskQuery, [taskValues], (err) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }

                            res.status(200).json({ message: 'Evaluation system and tasks added successfully' });
                        });
                    });
                });
            });
        });
    });
});

// 新增接口：删除评估系统
router.delete('/deleteUserWork', (req, res) => {
    const { systemId } = req.body;

    if (!systemId) {
        return res.status(400).json({ error: 'System ID is required' });
    }

    // 删除与评估系统相关的任务
    const deleteTasksQuery = `
        DELETE FROM card_task WHERE task_id IN (
            SELECT task_id FROM card_system WHERE system_id = ?
        );
    `;

    db.query(deleteTasksQuery, [systemId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // 删除评估系统
        const deleteSystemQuery = `
            DELETE FROM card_system WHERE system_id = ?;
        `;

        db.query(deleteSystemQuery, [systemId], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // 删除用户与评估系统的关联
            const deleteUserSystemMapQuery = `
                DELETE FROM user_businesssystem_map WHERE businessSystem_id = ?;
            `;

            db.query(deleteUserSystemMapQuery, [systemId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(200).json({ message: 'Evaluation system and related tasks deleted successfully' });
            });
        });
    });
});

// 新增接口：修改评估系统
router.put('/updateUserWork', (req, res) => {
    const { systemId, userId, businessSystemName, superintendentName, superintendentPhone, superintendentEmail, workClassification, endAt } = req.body;

    if (!systemId || !userId) {
        return res.status(400).json({ error: 'System ID and User ID are required' });
    }

    // 查询当前 system_id 所属的用户
    const checkUserQuery = `
        SELECT cu.id as currentUserId
        FROM card_system cs
        JOIN user_businesssystem_map ubm ON cs.system_id = ubm.businessSystem_id
        JOIN card_users cu ON ubm.user_businessSystem_list_id = cu.businessSystemListID
        WHERE cs.system_id = ?;
    `;

    db.query(checkUserQuery, [systemId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'System not found' });
        }

        const currentUserId = results[0].currentUserId;

        // 如果用户不同，更新 user_businesssystem_map 表
        if (currentUserId !== userId) {
            const updateUserSystemMapQuery = `
                UPDATE user_businesssystem_map
                SET user_businessSystem_list_id = (SELECT businessSystemListID FROM card_users WHERE id = ?)
                WHERE businessSystem_id = ?;
            `;

            db.query(updateUserSystemMapQuery, [userId, systemId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
            });
        }

        // 更新 card_system 表中的信息
        const updateSystemQuery = `
            UPDATE card_system
            SET system_name = ?, superintendent_name = ?, superintendent_phone = ?, superintendent_email = ?, work_classification = ?, end_at = ?
            WHERE system_id = ?;
        `;

        db.query(updateSystemQuery, [businessSystemName, superintendentName, superintendentPhone, superintendentEmail, workClassification, endAt, systemId], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(200).json({ message: 'Evaluation system updated successfully' });
        });
    });
});

module.exports = router;