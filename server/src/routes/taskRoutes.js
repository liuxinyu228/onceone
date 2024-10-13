const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const { v4: uuidv4 } = require('uuid');
const Util = require('../utils/util'); // 修改引用方式
const {cardTaskTemplate,cardTask} = require("../models/cardTask");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// 根据工作类型获取所有任务模板
router.get('/taskTemplate/:taskType', (req, res) => {
    cardTaskTemplate.getAllTaskByType(req.params.taskType, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json(results);
        }
    });
});

// 新增接口：新增任务模板
router.post('/taskTemplate', (req, res) => {
    const taskInfo = req.body;

    cardTaskTemplate.addTask(taskInfo, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const taskTemplateId = result.insertId;

        // 查询所有任务并按 task_id 分组
        const selectTasksQuery = `
            SELECT task_id, work_classification FROM card_task GROUP BY task_id;
        `;

        db.query(selectTasksQuery, (err, tasks) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // 筛选需要新增任务的组
            const taskValues = tasks
                .filter(task => task.work_classification === taskInfo.work_classification)
                .map(task => [
                    '进行中',
                    taskInfo.title,
                    taskInfo.work_classification,
                    taskInfo.description,
                    taskInfo.guide,
                    taskInfo.reportContent,
                    taskInfo.materialPath,
                    taskInfo.taskCategory,
                    new Date(),
                    new Date(),
                    task.task_id, // 关联 task_id
                    taskTemplateId // 关联 template_id
                ]);

            if (taskValues.length === 0) {
                return res.status(200).json({ message: 'No tasks need to be added for this classification' });
            }

            // 为每一个符合条件的组新增任务
            const insertTaskQuery = `
                INSERT INTO card_task (status, title, work_classification, description, guide, reportContent, materialPath, taskCategory, created_at, updated_at, task_id, template_id)
                VALUES ?;
            `;

            db.query(insertTaskQuery, [taskValues], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(201).json({ message: 'Task template and tasks added successfully', taskId: taskTemplateId });
            });
        });
    });
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
            SET title = ?, description = ?, guide = ?, taskCategory = ?
            WHERE template_id = ?;
        `;

        const updateValues = [
            updatedTaskInfo.title,
            updatedTaskInfo.description,
            updatedTaskInfo.guide,
            updatedTaskInfo.taskCategory,
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
        DELETE FROM card_task WHERE template_id = ?;
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

// 新增接口：查询用户下所有评估业务系统
router.get('/userWorks', (req, res) => { 
    const username = req.session.userId; // 从 session 中获取用户名
    const groupId = req.session.groupId; // 从查询参数中获取 group_id
    const personaId = req.session.personaId; // 从查询参数中获取 persona_id

    if (!username) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    // 查询总数和数据
    let query = `
        SELECT cs.system_name, cs.work_classification, cs.superintendent_name, cs.created_at
        FROM card_system cs
        JOIN user_businesssystem_map ubm ON cs.system_id = ubm.businessSystem_id
        WHERE ubm.group_id = ?
    `;

    const queryParams = [groupId];

    if (personaId == 707) {
        query += ' AND cs.superintendent_name = ?';
        queryParams.push(username);
    }

    console.log("userWorks sql:", query)
    console.log("userWorks parms:", queryParams)

    db.query(query, queryParams, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({
                data: results,
                total: results.length
            });
        }
    });
});

// 新增接口：根据用户组、系统名称和工作分类查询任务
router.get('/userWorkTasks', (req, res) => {
    const username = req.session.userId; // 从 session 中获取用户名
    const groupId = req.session.groupId

    if (!username) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    // 从 Cookie 中获取加密的系统信息并解密
    const encryptedTaskInfo = req.cookies.taskInfo;
    const decryptedTaskInfo = Util.decrypt(encryptedTaskInfo); // 修改为最新的引用方式

    cardTask.getUserWorkTasks(groupId, decryptedTaskInfo, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        } else {
            // 处理 materialPath 字段
            results.forEach(task => {
                if (task.materialPath) {
                    try {
                        const materialPaths = JSON.parse(task.materialPath);
                        task.materialPath = materialPaths.map(item => ({
                            ...item,
                            path: path.basename(item.path)
                        }));
                    } catch (e) {
                        task.materialPath = [];
                    }
                }
            });

            return res.status(200).json(results);
        }
    });
});

// 新增接口：新增用户工作任务
router.post('/addUserWorkTask', (req, res) => {
    const username = req.session.userId; // 从 session 中获取用户名
    const groupId = req.session.groupId; // 从 session 中获取 group_id

    if (!username) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    // 从 Cookie 中获取加密的系统信息并解密
    const encryptedTaskInfo = req.cookies.taskInfo;

    cardTask.addUserWorkTask(groupId, req.body, encryptedTaskInfo, (err,results) => {
        if (err) {
            return res.status(500).json({error: err.message });
        }
        res.status(201).json({id:results.insertId,message: 'User work task added successfully' });
    });
});

// 新增接口：新增评估系统
router.post('/addUserWork', (req, res) => {
    const username = req.session.userId; // 从 session 中获取用户名
    const groupId = req.session.groupId

    if (!username) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    const { businessSystemName, superintendentName, superintendentPhone, superintendentEmail, workClassification, creationDate } = req.body;

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
            return res.status(400).json({ message: 'Evaluation system with the same name and task type already exists in the group' });
        }

        const taskId = uuidv4();

        // 在 card_system 中创建评估系统记录
        const insertSystemQuery = `
            INSERT INTO card_system (system_name, superintendent_name, superintendent_phone, superintendent_email, work_classification, task_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        db.query(insertSystemQuery, [businessSystemName, superintendentName, superintendentPhone, superintendentEmail, workClassification, taskId, creationDate], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const systemId = result.insertId;

            // 将创建的评估系统记录与 card_users 中对应的用户进行关联
            const insertUserSystemMapQuery = `
                INSERT INTO user_businesssystem_map (user_businessSystem_list_id, businessSystem_id,group_id)
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
                            INSERT INTO card_task (status, title, work_classification, description, guide, reportContent, materialPath, taskCategory, created_at, updated_at, task_id, template_id)
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
                            taskId, // 关联 task_id
                            task.id // 关联 template_id
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

// 新增接口：根据任务ID修改任务
router.post('/updateTask/:id', (req, res) => {
    const taskId = req.params.id;
    const updatedTaskInfo = req.body;
    const personaId = req.session.personaId; // 获取 persona_id

    if (personaId == 707) {
        return res.status(403).json({ status: false,message: 'Permission denied' });
    }

    cardTask.updateTaskById(taskId, updatedTaskInfo, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        } else {
            return res.status(200).json({ message: 'Task updated successfully' });
        }
    });
});

router.post('/getTaskByCategory',(req,res)=>{
    const category = req.body.category;
    cardTask.getTaskByCategory(category,(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }else{
            return res.status(200).json(results);
        }
    })
})

// 新增接口：根据任务ID修改materialPath值，并且存储文件到项目根目录下的uploads/system_name/work_classification目录下
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/temp');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const tempFileName = uuidv4(); // 使用 uuid 生成临时文件名
        cb(null, tempFileName);
    }
});

const upload = multer({ storage });

router.post('/updateTaskMaterial/:id', upload.single('file'), (req, res) => {
    const taskId = req.params.id;
    const personaId = req.session.personaId; // 获取 persona_id
    const MAX_MATERIAL_LEN = 6;
    const resultMaterialPath = [];

    if (personaId == 707) {
        return res.status(403).json({ message: 'Permission denied' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path); // 删除临时文件
        return res.status(400).json({ message: '仅支持上传jpeg、png、jpg格式的文件' });
    }

    const decodedFileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8'); // 处理文件名称为中文的情况

    // 查询当前 materialPath 的内容
    const selectQuery = `
        SELECT title,materialPath FROM card_task WHERE id = ?;
    `;

    db.query(selectQuery, [taskId], (err, results) => {
        if (err) {
            fs.unlinkSync(req.file.path); // 删除临时文件
            return res.status(500).json({ error: err.message });
        }

        let currentMaterialPath = [];
        if (results.length > 0 && results[0].materialPath) {
            try {
                currentMaterialPath = JSON.parse(results[0].materialPath);
            } catch (e) {
                currentMaterialPath = [];
            }
        }

        // 检查文件名是否已存在
        const fileNameExists = currentMaterialPath.some(item => path.basename(item.path) === decodedFileName);
        if (fileNameExists) {
            fs.unlinkSync(req.file.path); // 删除临时文件
            return res.status(400).json({ message: 'File name already exists' });
        }

        // 检查长度限制
        if (currentMaterialPath.length >= MAX_MATERIAL_LEN) {
            fs.unlinkSync(req.file.path); // 删除临时文件
            return res.status(400).json({ message: 'Material path limit exceeded' });
        }

        // 确定最终的上传目录
        const { system_name, work_classification } = JSON.parse(Util.decrypt(req.cookies.taskInfo));
        const decodedSystemName = Buffer.from(system_name, 'latin1').toString('utf8');
        const finalDir = path.join(__dirname, '../../uploads/works', decodedSystemName, work_classification, results[0].title);
        fs.mkdirSync(finalDir, { recursive: true });

        // 重命名文件到最终目录
        const finalPath = path.join(finalDir, decodedFileName);
        fs.renameSync(req.file.path, finalPath);

        // 使用 uuid 生成唯一的 id
        const newId = uuidv4();
        currentMaterialPath.push({ id: newId, path: path.relative(path.join(__dirname, '../../'), finalPath) });

        const updateQuery = `
            UPDATE card_task
            SET materialPath = ?
            WHERE id = ?;
        `;

        db.query(updateQuery, [JSON.stringify(currentMaterialPath), taskId], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            for (const material of currentMaterialPath) {
                resultMaterialPath.push({ id: material.id, path: path.basename(material.path) });
            }

            res.status(200).json({ taskId: taskId, filePath: resultMaterialPath });
        });
    });
});

// 新增接口：根据任务ID下载上传的文件
router.get('/downloadTaskMaterial/:id', (req, res) => {
    const taskId = req.params.id;
    const fileId = req.query.fileId; // 假设通过查询参数传递文件ID

    const query = `
        SELECT materialPath FROM card_task WHERE id = ?;
    `;

    db.query(query, [taskId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        let materialPath = [];
        try {
            materialPath = JSON.parse(results[0].materialPath);
        } catch (e) {
            return res.status(500).json({ error: 'Failed to parse materialPath' });
        }

        // 找到要下载的文件
        const fileToDownload = materialPath.find(item => item.id === fileId);
        if (!fileToDownload) {
            return res.status(404).json({ message: 'File not found' });
        }

        const fileName = path.basename(fileToDownload.path);
        const filePath = path.join(__dirname, '../../', fileToDownload.path);

        // 使用res.download方法下载文件
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.download(filePath, fileName, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
        });
    });
});

router.post('/removeTaskMaterial/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const fileId = req.body.fileId; // 从请求体中获取要移除的文件ID

    // 查询当前 materialPath 的内容
    const selectQuery = `
        SELECT materialPath FROM card_task WHERE id = ?;
    `;

    db.query(selectQuery, [taskId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        let currentMaterialPath = [];
        if (results.length > 0 && results[0].materialPath) {
            try {
                currentMaterialPath = JSON.parse(results[0].materialPath);
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse materialPath' });
            }
        }

        // 找到要删除的文件
        const fileToRemove = currentMaterialPath.find(item => item.id === fileId);
        if (!fileToRemove) {
            return res.status(404).json({ message: 'File not found' });
        }

        // 删除文件
        const filePath = path.join(__dirname, '../../', fileToRemove.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete file' });
            }

            // 移除指定的文件
            currentMaterialPath = currentMaterialPath.filter(item => item.id !== fileId);

            const updateQuery = `
                UPDATE card_task
                SET materialPath = ?
                WHERE id = ?;
            `;

            db.query(updateQuery, [JSON.stringify(currentMaterialPath), taskId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                // 使用 path.basename 处理 materialPath 中的 path
                const processedMaterialPath = currentMaterialPath.map(item => ({
                    ...item,
                    path: path.basename(item.path)
                }));

                res.status(200).json({ message: 'File removed successfully', materialPath: processedMaterialPath });
            });
        });
    });
});

module.exports = router;