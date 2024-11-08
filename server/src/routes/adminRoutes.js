const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const logger = require('../utils/log');
const { v4: uuidv4 } = require('uuid');
const cardUser = require('../models/cardUser');
const {cardTaskTemplate} = require("../models/cardTask");

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
                TO_CHAR(card_system.end_at, 'YYYY-MM-DD') AS end_at, 
                card_system.work_classification, 
                JSON_AGG(JSON_BUILD_OBJECT('id', card_task.id, 'status', card_task.status)) AS tasks
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
                card_system.system_id, 
                card_system.system_name, 
                card_system.superintendent_name, 
                card_system.superintendent_phone, 
                card_system.superintendent_email,
                card_users.username, 
                card_users.id, 
                card_system.end_at, 
                card_system.work_classification
        `, (error, results) => {
            if (error) {
                console.error('Error fetching evaluations:', error);
                return res.status(500).json({ status: false, message: 'Server Error' });
            }

            console.log("Query result:", JSON.stringify(results, null, 2));
            res.json(results.rows);
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

            res.json({ status: true, data: results.rows });
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
        WHERE ubm.group_id = $1 AND cs.system_name = $2 AND ct.work_classification = $3;
    `;

    db.query(checkQuery, [groupId, businessSystemName, workClassification], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }

        if (results.rows.length > 0) {
            return res.status(400).json({ error: 'Evaluation system with the same name and task type already exists in the group' });
        }

        const taskId = uuidv4();

        // 在 card_system 中创建评估系统记录
        const insertSystemQuery = `
            INSERT INTO card_system (system_name, superintendent_name, superintendent_phone, superintendent_email, work_classification, task_id, end_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING system_id;
        `;

        db.query(insertSystemQuery, [businessSystemName, superintendentName, superintendentPhone, superintendentEmail, workClassification, taskId, endAt], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }

            const systemId = result.rows[0].system_id;

            // 将创建的评估系统记录与 card_users 中对应的用户进行关联
            const insertUserSystemMapQuery = `
                INSERT INTO user_businesssystem_map (user_businessSystem_list_id, businessSystem_id, group_id)
                SELECT 
                    COALESCE(businessSystemListID, $1), 
                    $2,
                    $3
                FROM card_users 
                WHERE username = $4;
            `;

            const newBusinessSystemListID = uuidv4();

            db.query(insertUserSystemMapQuery, [newBusinessSystemListID, systemId, groupId, username], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: err.message });
                }

                // 更新 card_users 表中的 businessSystemListID 字段
                const updateUserBusinessSystemListIDQuery = `
                    UPDATE card_users
                    SET businessSystemListID = $1
                    WHERE username = $2 AND businessSystemListID IS NULL;
                `;

                db.query(updateUserBusinessSystemListIDQuery, [newBusinessSystemListID, username], (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ error: err.message });
                    }

                    // 根据 workClassification 参数的值在 card_task_template 表中查询出对应的任务
                    const selectTaskTemplateQuery = `
                        SELECT * FROM card_task_template WHERE work_classification = $1;
                    `;

                    db.query(selectTaskTemplateQuery, [workClassification], (err, taskTemplates) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ error: err.message });
                        }

                        // 在 card_task 表中新增对应记录，并关联 task_id
                        const insertTaskQuery = `
                            INSERT INTO card_task (status, title, work_classification, description, guide, taskcategory, created_at, updated_at, task_id, template_id, system_default_value)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true);
                        `;

                        // 使用批量插入
                        const insertValues = [];
                        const placeholders = [];

                        taskTemplates.rows.forEach((task, index) => {
                            insertValues.push(
                                '进行中',
                                task.title, // title
                                task.work_classification, // work_classification
                                task.description, // description
                                task.guide, // guide
                                task.taskcategory, // taskcategory
                                new Date(), // created_at
                                new Date(), // updated_at
                                taskId, // task_id
                                task.id // template_id
                            );

                            // 计算占位符
                            const offset = index * 10;
                            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`);
                        });

                        db.query(`INSERT INTO card_task (status, title, work_classification, description, guide, taskcategory, created_at, updated_at, task_id, template_id) VALUES ${placeholders.join(', ')}`, insertValues, (err) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({ error: err.message });
                            }

                            res.status(200).json({ message: '已成功添加评估系统和任务' });
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

    // 删除用户与评估系系统的关联
    const deleteUserSystemMapQuery = `
        DELETE FROM user_businesssystem_map WHERE businessSystem_id = $1;
    `;

    db.query(deleteUserSystemMapQuery, [systemId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // 删除与评估系统相关的任务
        const deleteTasksQuery = `
            DELETE FROM card_task WHERE task_id IN (
                SELECT task_id FROM card_system WHERE system_id = $1
            );
        `;

        db.query(deleteTasksQuery, [systemId], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // 删除评估系统
            const deleteSystemQuery = `
                DELETE FROM card_system WHERE system_id = $1;
            `;

            db.query(deleteSystemQuery, [systemId], (err) => {
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
    let changeuserBusinessSystemListID = "";
    if (!systemId || !userId) {
        return res.status(400).json({ error: 'System ID and User ID are required' });
    }
    console.log(systemId, userId, businessSystemName);

    // 查询当前 system_id 所属的用户
    const checkUserQuery = `
        SELECT cu.id as currentUserId, cu.businessSystemListID
        FROM card_system cs
        JOIN user_businesssystem_map ubm ON cs.system_id = ubm.businessSystem_id
        JOIN card_users cu ON ubm.user_businessSystem_list_id = cu.businessSystemListID
        WHERE cs.system_id = $1;
    `;

    db.query(checkUserQuery, [systemId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'System not found' });
        }

        const currentUserId = results.rows[0].currentuserid;

        // 查询并检查 userId 对应的 businessSystemListID 是否为空
        const checkchangeUserBusinessSystemListIDQuery = `
            SELECT businessSystemListID FROM card_users WHERE id = $1;
        `;

        db.query(checkchangeUserBusinessSystemListIDQuery, [userId], (err, userResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (userResults.rows.length > 0 && !userResults.rows[0].businesssystemlistid) {
                changeuserBusinessSystemListID = uuidv4();
                const updateUserBusinessSystemListIDQuery = `
                    UPDATE card_users
                    SET businessSystemListID = $1
                    WHERE id = $2;
                `;
                db.query(updateUserBusinessSystemListIDQuery, [changeuserBusinessSystemListID, userId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                });
            } else {
                changeuserBusinessSystemListID = userResults.rows[0].businesssystemlistid;
            }

            // 如果用户不同，更新 user_businesssystem_map 表
            if (currentUserId !== userId) {
                const updateUserSystemMapQuery = `
                    UPDATE user_businesssystem_map
                    SET 
                        user_businessSystem_list_id = $1,
                        group_id = (SELECT group_id FROM card_users WHERE id = $2)
                    WHERE businessSystem_id = $3;
                `;

                db.query(updateUserSystemMapQuery, [changeuserBusinessSystemListID, userId, systemId], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                });
            }

            // 更新 card_system 表中的信息
            const updateSystemQuery = `
                UPDATE card_system
                SET system_name = $1, superintendent_name = $2, superintendent_phone = $3, superintendent_email = $4, end_at = $5
                WHERE system_id = $6;
            `;

            db.query(updateSystemQuery, [businessSystemName, superintendentName, superintendentPhone, superintendentEmail, endAt, systemId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(200).json({ message: 'Evaluation system updated successfully' });
            });
        });
    });
});

// 新增用户接口
router.post('/addUser', (req, res) => {
    const user = req.body;

    // 生成随机密码
    const generateRandomPassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        return password;
    };

    user.password = generateRandomPassword();

    // 查询是否有已存在的用户名
    const query = 'SELECT * FROM card_users WHERE username = $1'; // 使用 $1 作为参数占位符
    db.query(query, [user.username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.rows.length > 0) { // PostgreSQL 中使用 rows
            return res.status(400).json({ message: 'Username already exists' });
        }

        // 如果用户名不存在，则添加用户
        cardUser.addUser(user, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.status(201).json({ message: 'User added successfully', userId: result.insertId, password: user.password });
        });
    });
});

// 新增 /getAllUsers 接口，查询所有用户
router.get('/getAllUsers', (req, res) => {
    cardUser.getAllUsers((err, users) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        res.json(users.rows);
    });
});

// 新增 /updateUser 接口，更新用户信息
router.post('/updateUser', (req, res) => {
    const { id, username, status, email, is_admin, phone, group_id, persona_id } = req.body;

    const user = { username, status, email, is_admin, phone, group_id, persona_id };

    cardUser.updateUser(id, user, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully' });
    });
});

// 新增 /lockUser 接口，锁定用户,已锁定则解锁
router.post('/lockUser', (req, res) => {
    const { id } = req.body;

    // 查询用户当前状态
    const query = 'SELECT status FROM card_users WHERE id = $1';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: '服务器错误！', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: '用户未找到' });
        }

        const currentStatus = results[0].status;

        // 根据当前状态调用锁定或解锁方法
        if (currentStatus === 1) {
            cardUser.unlockUser(id, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: '服务器错误！'});
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: '用户未找到' });
                }
                res.status(200).json({ message: '用户解锁成功' });
            });
        } else {
            cardUser.lockUser(id, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: '服务器错误！' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: '用户未找到' });
                }
                res.status(200).json({ message: '用户锁定成功' });
            });
        }
    });
});

// 新增 /deleteUser 接口，删除用户
router.delete('/deleteUser', (req, res) => {
    const { id } = req.body;

    // 删除 card_task 表中用户拥有的任务
    const deleteUserTasksQuery = `
        DELETE FROM card_task WHERE task_id IN (
            SELECT task_id FROM card_system WHERE system_id IN (
                SELECT businessSystem_id FROM user_businesssystem_map WHERE user_businessSystem_list_id = (
                    SELECT businessSystemListID FROM card_users WHERE id = $1
                )
            )
        );
    `;

    db.query(deleteUserTasksQuery, [id], (err) => {
        if (err) {
            return res.status(500).json({ message: '服务器错误！' });
        }

        // 删除 card_system 表中用户拥有的系统
        const deleteUserSystemsQuery = `
            DELETE FROM card_system WHERE system_id IN (
                SELECT businessSystem_id FROM user_businesssystem_map WHERE user_businessSystem_list_id = (
                    SELECT businessSystemListID FROM card_users WHERE id = $1
                )
            );
        `;

        db.query(deleteUserSystemsQuery, [id], (err) => {
            if (err) {
                return res.status(500).json({ message: '服务器错误！'});
            }

            // 删除 user_businesssystem_map 表中的绑定关系
            const deleteUserSystemMapQuery = `
                DELETE FROM user_businesssystem_map WHERE user_businessSystem_list_id = (
                    SELECT businessSystemListID FROM card_users WHERE id = $1
                );
            `;

            db.query(deleteUserSystemMapQuery, [id], (err) => {
                if (err) {
                    return res.status(500).json({ message: '服务器错误！' });
                }

                // 最后删除用户
                cardUser.deleteUser(id, (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: '服务器错误！' });
                    }
                    res.status(200).json({ message: '用户删除成功' });
                });
            });
        });
    });
});


// 根据工作类型获取所有任务模板
router.get('/taskTemplate/:taskType', (req, res) => {
    cardTaskTemplate.getAllTaskByType(req.params.taskType, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(results.rows);
        }
    });
});

// 新增接口：新增任务模板
router.post('/taskTemplate', async (req, res) => {
    const taskInfo = req.body;
    const client = await db.connect(); // 获取数据库连接

    try {
        await client.query('BEGIN'); // 开始事务

        const result = await cardTaskTemplate.addTask(taskInfo);
        const taskTemplateId = result.rows[0].id;
        logger.info("POST /taskTemplate 新增任务模板成功，taskTemplateId为："+taskTemplateId);

        const selectTasksQuery = `
            SELECT task_id, MAX(work_classification) AS work_classification FROM card_task GROUP BY task_id;
        `;

        const tasks = await client.query(selectTasksQuery);

        const taskValues = tasks.rows
            .filter(task => task.work_classification === taskInfo.work_classification)
            .map(task => [
                '进行中',
                taskInfo.title,
                taskInfo.work_classification,
                taskInfo.description,
                taskInfo.guide,
                taskInfo.reportContent, // 确保此参数存在
                taskInfo.materialPath,  // 确保此参数存在
                taskInfo.taskcategory,
                new Date(),
                new Date(),
                task.task_id, // 关联 task_id
                taskTemplateId // 关联 template_id
            ]);

        if (taskValues.length > 0) {
            const insertTaskQuery = `
                INSERT INTO card_task (status, title, work_classification, description, guide, reportContent, materialPath, taskcategory, created_at, updated_at, task_id, template_id, system_default_value)
                VALUES ${taskValues.map((_, i) => `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, $${i * 13 + 5}, $${i * 13 + 6}, $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, true)`).join(', ')};
            `;

            const insertValues = taskValues.flat();
            await client.query(insertTaskQuery, insertValues);
        }

        await client.query('COMMIT'); // 提交事务
        res.status(201).json({ message: '任务模板添加成功', taskId: taskTemplateId });
    } catch (err) {
        await client.query('ROLLBACK'); // 回滚事务
        console.error('Transaction error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release(); // 释放数据库连接
    }
});

// 新增接口：更新任务模板
router.post('/updateTaskTemplate/:id', (req, res) => {
    const taskTemplateId = req.params.id;
    const updatedTaskInfo = req.body;

    cardTaskTemplate.updateTaskById(taskTemplateId, updatedTaskInfo, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // 更新 card_task 表中与 template_id 相关的记录
        const updateTaskQuery = `
            UPDATE card_task
            SET title = $1, description = $2, guide = $3, taskcategory = $4
            WHERE template_id = $5;
        `;

        const updateValues = [
            updatedTaskInfo.title,
            updatedTaskInfo.description,
            updatedTaskInfo.guide,
            updatedTaskInfo.taskcategory,
            taskTemplateId // 关联 template_id
        ];

        db.query(updateTaskQuery, updateValues, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(200).json({ message: 'Task template and related tasks updated successfully' });
        });
    });
});

// 新增接口：删除任务模板
router.delete('/taskTemplate/', (req, res) => {
    const { taskTemplateId } = req.body;

    // 先删除 card_task 中与 template_id 相关的记录
    const deleteTasksQuery = `
        DELETE FROM card_task WHERE template_id = $1;
    `;

    db.query(deleteTasksQuery, [taskTemplateId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // 然后删除 card_task_template 中的记录
        cardTaskTemplate.deleteTaskById(taskTemplateId, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Task template and related tasks deleted successfully' });
        });
    });
});


module.exports = router;
