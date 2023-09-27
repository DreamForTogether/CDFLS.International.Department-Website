const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

const newCourse = "new";
const updateCourse= "update";
const delectCourse = "delete";

// Define the schema and model
const coursesSchema = new mongoose.Schema({
    name: String,
    cn_name: String,
    id: Number,
    description: String,
    type: String,
    attribute: String,
    syllabus: Array,
    teacherId: Array
});
const courses = mongoose.model("courses", coursesSchema);
// MongoDB connection URL
const connectUrl ="mongodb+srv://3564028649:JuZOZdN8WLlCONx8@gratiano.iuy275q.mongodb.net/cflswebsite";

app.use(express.json());
app.use(cors());

class course
{
    //读取所有的课程
    static async read(req, res)
    {
        const courseId = req.query.id;
        const courseName = req.query.id;
        const courseType = req.query.type;
        const courseAttribute = req.query.attribute;
        var returnJson = {error_msg:"", list:[]};

        try
        {
            if (courseId != null) //根据Id搜索
            {
                const searchCourse = await courses.findOne({id:courseId});
                if (searchCourse != null)
                    returnJson.list.push(searchCourse);  
                else
                    returnJson.error_msg = "Cannot find the course";
            }
            else if (courseName == null && courseType == null && courseAttribute == null) //无参数的时候全部输出
            {
                const searchCourse = await courses.find({});
                if (searchCourse != null)
                {
                    for (const Course of searchCourse)
                        returnJson.list.push(Course);
                }   
            }
            else
            {
                var tempCourse = await courses.find({});
                function selectName(certainJson)
                {
                    var arr = [];
                    for (const Course of certainJson)
                    {
                        if (Course.name.indexof(courseName) != -1 || Course.cn_name.indexof(courseName) != -1)
                            arr.push(Course);
                    }
                    return arr;
                }
                function selectAttribute(certainJson)
                {
                    var arr = [];
                    for (const Course of certainJson)
                    {
                        if (Course.attribute.includes(courseAttribute))
                            arr.push(Course);
                    }
                    return arr;
                } 
                function selectType(certainJson)
                {
                    var arr = [];
                    for (const Course of certainJson)
                    {
                        if (Course.type.includes(courseType))
                            arr.push(Course);
                    }
                    return arr;
                }
                if (courseName != null)
                    tempCourse = selectName(tempCourse);
                if (courseType != null)
                    tempCourse = selectType(tempCourse);
                if (courseAttribute != null)
                    tempCourse = selectAttribute(tempCourse);
                if (tempCourse.length == 0)
                    returnJson.error_msg = "Cannot find the course";
                else
                {
                    for (const Course of  tempCourse)
                        returnJson.list.push(Course);
                }
            }
            res.status(200).json(returnJson);
        } catch (error) {res.status(500).json({error_msg:"" + error, list:[]});}
    }

    //搜索提示词
    static async smartBox(req, res)
    {
        try
        {
            const searchName = req.query.name;
            const number = req.query.number || 5;
            var i = 1;
            var returnJson = {error_msg:"", list:[]}

            const searchCourse = await courses.find({});
            if (searchName == null) {returnJson.error_msg = "The parameter (name) is required";}
            else if (searchCourse != null)
            {
                for (const Course of searchCourse)
                {
                    if (Course.name.indexOf(searchName) != -1 || Course.cn_name.indexOf(searchName) != -1)
                    {returnJson.list.push(Course.name); i++}
                    if (i > number) break;
                }
            }
            res.status(200).json(returnJson);
        }
        catch (error) {res.status(500).json({error_msg:"" + error, list:[]});}
    }

    //添加一个课程
    static async create(req, res)
    {
        try
        {
            var {name, cn_name, description, type, attribute, syllabus, teacherId, code} = req.body;
            var returnJson = {error_msg:"", phase:""};

            if (description == null)
                description = "暂无简介";
            if (teacherId == null)
                teacherId = [-1];
            if (name == null)
            {returnJson.error_msg = "The parameter (name) is required"; returnJson.phase = "Cannot create a course";}
            else if (cn_name == null)
            {returnJson.error_msg = "The parameter (cn_name) is required"; returnJson.phase = "Cannot create a course";}
            else if (type == null)
            {returnJson.error_msg = "The parameter (type) is required"; returnJson.phase = "Cannot create a course";}
            else if (attribute == null)
            {returnJson.error_msg = "The parameter (attribute) is required"; returnJson.phase = "Cannot create a course";}
            else if (syllabus == null)
            {returnJson.error_msg = "The parameter (syllabus) is required"; returnJson.phase = "Cannot create a course";}
            else if (!Array.isArray(syllabus))
            {returnJson.error_msg = "The parameter (syllabus) must be an array"; returnJson.phase = "Cannot create a course";}
            else if (!Array.isArray(teacherId))
            {returnJson.error_msg = "The parameter (teacherId) must be an array"; returnJson.phase = "Cannot create a course";}
            else if (code == null)
            {returnJson.error_msg = "The parameter (code) is required"; returnJson.phase = "Cannot create a course";}
            else if (code == newCourse)
            {
                var idList = [], newId = 0;
                const searchCourse = await courses.find({});
                for (const Course of searchCourse)
                    idList.push(Course.id);
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
                const newCourses = new courses({
                    name: name,
                    cn_name: cn_name,
                    id: newId,
                    description: description,
                    type: type,
                    attribute: attribute,
                    syllabus: syllabus,
                    teacherId: teacherId
                });
                await newCourses.save().then((result) =>
                {
                    returnJson.error_msg = "";
                    returnJson.phase = "Adding successfully. The new course id is:" + newId;
                }).catch((error) =>
                {
                    returnJson.error_msg = "" + error;
                    returnJson.phase = "Cannot create a course" + newId;
                });
            }
            else
            {returnJson.error_msg = "The code is invalid "; returnJson.phase = "Cannot create a teacher";}
            res.status(200).json(returnJson);
        }
        catch (error) {res.status(500).json({error_msg:"" + error, phase:"Cannot create the course"});}
    }

    //更新课程
    static async update(req, res)
    {
        try
        {
            var {originalName, originalId, newName, newCn_name, newDescription, newType, newAttribute, newSyllabus, newTeacherId, code} = req.body;
            var returnJson = {error_msg:"", phase:""};
            if (originalId == null && originalName == null)
            {returnJson.error_msg = "The parameter (originalName or originalId) is required"; returnJson.phase = "Cannot update the course";}
            else if (newSyllabus != null && !Array.isArray(newSyllabus))
            {returnJson.error_msg = "The parameter (syllabus) must be an array"; returnJson.phase = "Cannot update the course";}
            else if (newSyllabus != null && !Array.isArray(newTeacherId))
            {returnJson.error_msg = "The parameter (teacherId) must be an array"; returnJson.phase = "Cannot update the course";}
            else if (code == null)
            {returnJson.error_msg = "The parameter (code) is required"; returnJson.phase = "Cannot update the course";}
            else if (code == updateCourse)
            {
                if (originalId != null)
                {
                    const certainCourse = await courses.findOne({id:originalId});
                    if (certainCourse == null)
                    {returnJson.error_msg = "Cannot find the course"; returnJson.phase = "Cannot update the course";}
                    else
                    {
                        await courses.findOneAndUpdate({id:originalId}, {
                            $set:
                            {
                                name: newName != null ? newName : certainCourse.name,
                                cn_name: newCn_name != null ? newCn_name : certainCourse.cn_name,
                                description: newDescription != null ? newDescription : certainCourse.description,
                                type: newType != null ? newType : certainCourse.type,
                                attribute: newAttribute != null ? newAttribute : certainCourse.attribute,
                                syllabus: newSyllabus != null ? newSyllabus : certainCourse.syllabus,
                                teacherId: newTeacherId != null ? newTeacherId : certainCourse.teacherId
                            }
                        })
                    }
                }
                else if (originalName != null)
                {
                    const certainCourse = await courses.findOne({name:originalName});
                    if (certainCourse == null)
                    {returnJson.error_msg = "Cannot find the course"; returnJson.phase = "Cannot update the course";}
                    else
                    {
                        await courses.findOneAndUpdate({name:originalName}, {
                            $set:
                            {
                                name: newName != null ? newName : certainCourse.name,
                                cn_name: newCn_name != null ? newCn_name : certainCourse.cn_name,
                                description: newDescription != null ? newDescription : certainCourse.description,
                                type: newType != null ? newType : certainCourse.type,
                                attribute: newAttribute != null ? newAttribute : certainCourse.attribute,
                                syllabus: newSyllabus != null ? syllabus : certainCourse.syllabus,
                                teacherId: newTeacherId != null ? teacherId : certainCourse.teacherId
                            }
                        })
                    }
                }
                returnJson.error_msg = "";
                returnJson.phase = "Update the teacher successfully";
            }
            else {returnJson.error_msg = "The code is invalid "; returnJson.phase = "Cannot update the teacher";}
                res.status(200).json(returnJson);
        }
        catch (error) {res.status(500).json({error_msg:"" + error, phase:"Cannot update the course"});}
    }

    //删除课程
    static async delete(req, res)
    {
        try
        {
            var {name, id, code} = req.body;
            var returnJson = {error_msg:"", phase:""};

            if (name == null && id == null)
            {returnJson.error_msg = "The parameter (name or id) is required"; returnJson.phase = "Cannot delete the teacher";}
            else if (code == null)
            {returnJson.error_msg = "The parameter (code) is required"; returnJson.phase = "Cannot delete the teacher";}
            else if (code == delectCourse)
            {
                if (id != null)  //根据原来的id查找老师
                {
                    await courses.findOne({id:id}).deleteOne().then((result) => 
                    {
                        returnJson.error_msg = "";
                        returnJson.phase = "Deleting the teacher successfully";
                    }).catch((error) =>
                    {
                        returnJson.error_msg = "" + error;
                        returnJson.phase = "Cannot delect the course";
                    });
                }
                else if (name != null) //根据原来的name查找老师
                {
                    await courses.findOne({name:name}).deleteOne().then((result) => 
                    {
                        returnJson.error_msg = "";
                        returnJson.phase = "Deleting the course successfully";
                    }).catch((error) =>
                    {
                        returnJson.error_msg = "" + error;
                        returnJson.phase = "Cannot delete the course";
                    });
                }
            }
            else
            {returnJson.error_msg = "The code is invalid"; returnJson.phase = "Cannot delete the course";}
            res.status(200).json(returnJson);
        }catch (error) {res.status(500).json({error_msg:"" + error, phase:"Cannot update the course"});}
    }
}

async function runAsyncMethods()
{
    try
    {
        //连接账户
        await mongoose.connect(connectUrl);

        app.get('/courses/search', course.read);
        app.get('/cources/searchSmartBox', course.smartBox);
        app.post('/cources/create', course.create);
        app.put('/cources/update', course.update);
        app.delete('/cources/delete', course.delete);
    }
    catch (error) {console.error(error.message);}
}

runAsyncMethods();
app.listen(port, () => console.log(`Listening on port ${port}`));