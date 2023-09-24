const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

//密码
const newTeacher = "new";
const updateTeacher = "update";
const delectTeacher = "delete";

// Define the schema and model
const teachersSchema = new mongoose.Schema({
    name: String,
    id: Number,
    avatarsUrl: String,
    description: String,
    type: Array,
    classesId: Array,
});
const teachers = mongoose.model("teachers", teachersSchema);
// MongoDB connection URL
const connectUrl = "xxxxxxxxxxxxxxxxxxxx";

app.use(express.json());
app.use(cors());

class teacher
{
    //读取所有教师的函数
    static async read(req, res)
    {
        try
        {
            const teacherId = req.query.id;
            const teacherName = req.query.name;
            const teacherType = req.query.type;
            var returnJson = {error_msg:"", list:[]};

            //根据teacherId搜索
            if (teacherId != null) 
            {
                const searchTeacher = await teachers.findOne({id:teacherId});
                if (searchTeacher != null)
                    returnJson.list.push(searchTeacher);  
                else
                    returnJson.error_msg = "Cannot find the teacher";
            }
            else if (teacherName == null && teacherType == null) //无参数的时输出全部的
            {
                const searchTeacher = await teachers.find({});
                if (searchTeacher != null)
                {
                    for (const Teacher of searchTeacher)
                        returnJson.list.push(Teacher);
                }
            }
            else
            {
                var tempTeacher = await teachers.find({});
                function selectName(certainJson)
                {
                    var arr = [];
                    for (const Teacher of certainJson)
                    {
                        if (Teacher.name.indexOf(teacherName) != -1)
                            arr.push(Teacher);
                    }
                    return arr;
                }
                function selectType(certainJson)
                {
                    var arr = [];
                    for (const Teacher of certainJson)
                    {
                        if (Teacher.type.includes(teacherType))
                            arr.push(Teacher);
                    }
                    return arr;
                }

                if (teacherName != null)
                    tempTeacher = selectName(tempTeacher);
                if (teacherType != null)
                    tempTeacher = selectType(tempTeacher);

                if (tempTeacher.length == 0)
                    returnJson.error_msg = "Cannot find the teacher";
                else
                {
                    for (const Teacher of tempTeacher)
                        returnJson.list.push(Teacher);
                }
            }
            res.status(200).json(returnJson);
        }
        catch (error) {res.status(500).json({error_msg:"" + error, list:[]});}
    }

    //获取搜索提示词
    static async smartBox(req, res)
    {
        try
        {
            const searchName = req.query.name;
            const number = req.query.number || 5;
            var i = 1;

            var returnJson = {error_msg:"", list:[]}
            const searchTeacher = await teachers.find({});
            if (searchName == null) {returnJson.error_msg = "The parameter (searchName) is required";}
            else if (searchTeacher != null)
            {
                for (const Teacher of searchTeacher)
                {
                    if (Teacher.name.indexOf(searchName) != -1) {returnJson.list.push(Teacher.name); i++}
                    if (i > number) break;
                }
            }
            else {returnJson.error_msg = "The parameter (searchName) is required", returnJson.list = []}
            res.status(200).json(returnJson);
        }
        catch (error) {res.status(500).json({error_msg:"" + error, list:[]});}
    }

    //添加一个老师
    static async create(req, res)
    {
        try
        {
            var {name, avatarsUrl, description, type, classesId, code} = req.body;
            var returnJson = {error_msg:"", phase:""};

            if (avatarsUrl == null)
                avatarsUrl = "https://cn.bing.com/images/search?view=detailV2&ccid=xA5QX2cr&id=0A79C1A8D133565949BD5B204FD24D70BFE3D547&thid=OIP.xA5QX2crc3fR5d0DIH-oDQAAAA&mediaurl=https%3a%2f%2fpic1.zhimg.com%2f50%2fv2-6afa72220d29f045c15217aa6b275808_hd.jpg%3fsource%3d1940ef5c&exph=300&expw=300&q=%e9%bb%98%e8%ae%a4%e5%a4%b4%e5%83%8f&simid=607995725626298830&FORM=IRPRST&ck=4D8E1CA5519A8FF520685968378DDF08&selectedIndex=28&ajaxhist=0&ajaxserp=0";
            if (description == null)
                description = "暂无简介";
            if (name == null)
            {returnJson.error_msg = "The parameter (name) is required"; returnJson.phase = "Cannot create a teacher";}
            else if (type == null)
            {returnJson.error_msg = "The parameter (type) is required"; returnJson.phase = "Cannot create a teacher";}
            else if (classesId == null)
            {returnJson.error_msg = "The parameter (classesId) is required"; returnJson.phase = "Cannot create a teacher";}
            else if (code == null)
            {returnJson.error_msg = "The parameter (code) is required"; returnJson.phase = "Cannot create a teacher";}
            else if (code == newTeacher)
            {
                var idList = [], newId = 0;
                const searchTeacher = await teachers.find({});
                for (const Teacher of searchTeacher)
                    idList.push(Teacher.id);
                if (idList.length == 0)
                    newId = 0;
                else
                {
                    idList.sort(function(a, b) {return a - b;});
                    newId = idList[idList.length - 1] + 1;
                }
                for (let i = 0; i < idList.length - 1; i++)
                {
                    if (idList[i + 1] - idList[i] !== 1)
                    {
                        newId = idList[i] + 1;
                        break;
                    }
                }
                const newTeacher = new teachers({
                    name: name,
                    id: newId,
                    avatarsUrl: avatarsUrl,
                    description: description,
                    type: type,
                    classesId: classesId
                });
                await newTeacher.save().then((result) =>
                {
                    returnJson.error_msg = "";
                    returnJson.phase = "Adding successfully. The new teacher id is:" + newId;
                }).catch((error) =>
                {
                    returnJson.error_msg = "" + error;
                    returnJson.phase = "Cannot create a teacher" + newId;
                });
            }
            else {returnJson.error_msg = "The code is invalid "; returnJson.phase = "Cannot create a teacher";}
            res.status(200).json(returnJson);
        }
        catch (error) {res.status(500).json({error_msg:"" + error, phase:"Cannot create the teacher"});}
    }

    //修改老师的信息
    static async update(req, res)
    {
        try
        {
            var {originalName, originalId, newName, newAvatarsUrl, newDescription, newType, newClassesId, code} = req.body;
            var returnJson = {error_msg:"", phase:""};
            if (originalId == null && originalName == null)
            {
                returnJson.error_msg = "The parameter (originalName or originalId) is required";
                returnJson.phase = "Cannot update the teacher";
            }
            else if (code == null)
            {
                returnJson.error_msg = "The parameter (code) is required";
                returnJson.phase = "Cannot update the teacher";
            }
            else if (code == updateTeacher)
            {
                if (originalId != null)
                {
                    const certainTeacher = await teachers.findOne({id: originalId});
                    if (!certainTeacher)
                    {
                        returnJson.error_msg = "Cannot find the teacher";
                        returnJson.phase = "Cannot update the teacher";
                    }
                    else
                    {
                        await teachers.findOneAndUpdate({id: originalId},
                        {
                            $set:
                            {
                                name: newName != null ? newName : certainTeacher.name,
                                id: certainTeacher.id,
                                avatarsUrl: newAvatarsUrl != null ? newAvatarsUrl : certainTeacher.avatarsUrl,
                                description: newDescription != null ? newDescription : certainTeacher.description,
                                type: newType != null ? newType : certainTeacher.type,
                                classesId: newClassesId != null ? newClassesId : certainTeacher.classesId
                            }
                        });
                        returnJson.error_msg = "";
                        returnJson.phase = "Update the teacher successfully";
                    }
                }
                else if (originalName != null)
                {
                    const certainTeacher = await teachers.findOne({ name: originalName });
                    if (!certainTeacher)
                    {
                        returnJson.error_msg = "Cannot find the teacher";
                        returnJson.phase = "Cannot update the teacher";
                    }
                    else
                    {
                        await teachers.findOneAndUpdate({ name: originalName },
                        {
                            $set:
                            {
                                name: newName != null ? newName : certainTeacher.name,
                                id: certainTeacher.id,
                                avatarsUrl: newAvatarsUrl != null ? newAvatarsUrl : certainTeacher.avatarsUrl,
                                description: newDescription != null ? newDescription : certainTeacher.description,
                                type: newType != null ? newType : certainTeacher.type,
                                classesId: newClassesId != null ? newClassesId : certainTeacher.classesId
                            }
                        });
                        returnJson.error_msg = "";
                        returnJson.phase = "Update the teacher successfully";
                    }
                }
            }
            else {returnJson.error_msg = "The code is invalid "; returnJson.phase = "Cannot update the teacher";}
            res.status(200).json(returnJson);
        } catch (error) {res.status(500).json({error_msg:"" + error, phase:"Cannot update the teacher"});} 
    }

    //删除指定的老师
    static async delete(req, res)
    {
        try
        {
            var {name, id, code} = req.body;
            var returnJson = {error_msg:"", phase:""};

            if (name == null && id == null)
            {
                returnJson.error_msg = "The parameter (name or id) is required";
                returnJson.phase = "Cannot delete the teacher";
            }
            else if (code == null)
            {
                returnJson.error_msg = "The parameter (code) is required";
                returnJson.phase = "Cannot delete the teacher";
            }
            else if (code == delectTeacher)
            {
                if (id != null)  //根据原来的id查找老师
                {
                    await teachers.findOne({id:id}).deleteOne().then((result) => 
                    {
                        returnJson.error_msg = "";
                        returnJson.phase = "Deleting the teacher successfully";
                    }).catch((error) =>
                    {
                        returnJson.error_msg = "" + error;
                        returnJson.phase = "Cannot delect the teacher";
                    });
                }
                else if (name != null) //根据原来的name查找老师
                {
                    await teachers.findOne({name:name}).deleteOne().then((result) => 
                    {
                        returnJson.error_msg = "";
                        returnJson.phase = "Deleting the teacher successfully";
                    }).catch((error) =>
                    {
                        returnJson.error_msg = "" + error;
                        returnJson.phase = "Cannot delete the teacher";
                    });
                }
            }
            else
            {
                returnJson.error_msg = "The code is Invalid";
                returnJson.phase = "Cannot delete the teacher";
            }

            res.status(200).json(returnJson);
        }
        catch (error) {res.status(500).json({error_msg:"" + error, phase:"Cannot update the teacher"});}
    }
}

async function runAsyncMethods()
{
    try
    {
        //连接账户
        await mongoose.connect(connectUrl);

        app.get('/teachers/search', teacher.read);
        app.get('/teachers/searchSmartBox', teacher.smartBox);
        app.post('/teachers/create', teacher.create);
        app.put('/teachers/update', teacher.update);
        app.delete('/teachers/delete', teacher.delete);
    }
    catch (error) {console.error(error.message);}
}

runAsyncMethods();
app.listen(port, () => console.log(`Listening on port ${port}`));
