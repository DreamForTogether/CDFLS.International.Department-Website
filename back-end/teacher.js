//引入库
//需要安装库：npm install mongoose
const mongoose = require("mongoose");
//更根据Json的值来写
const teachersSchema = new mongoose.Schema({name:String, id:Number, avatarsUrl:String, teacherType:Array, classesId:Array});
const teachers = mongoose.model("teachers", teachersSchema);

class teacher
{
    //name 教师名称 类型string
    //id 教师id 类型int
    //avatarsUrl 头像的URL 类型string
    //teacherType 教师的类型:班主任;AP老师;班主任 类型string[]
    //classesId 教的课程 类型int[]

    //第一种constructor
    constructor(name, id, avatarsUrl, teacherType, classesId)
    {
        this.name = name;
        this.id = id;
        this.avatarsUrl = avatarsUrl;
        this.teacherType = teacherType || [];
        this.classesId = classesId || [];
    }

    //第二钟constructor 用string类型的构造
    static parseTeacherByString(jsonString)
    {
        const jsonCode = JSON.parse(jsonString);
        const { name, id, avatarsUrl, teacherType, classesId } = jsonCode;
        return new teacher(name, id, avatarsUrl, teacherType, classesId);
    }

    //第三种constructor 用JSON类型构造
    static parseTeacherByJson(JSON)
    {
        const { name, id, avatarsUrl, teacherType, classesId } = JSON;
        return new teacher(name, id, avatarsUrl, teacherType, classesId);
    }

    //返回所有的Teacher 异步方法
    static async getTeacherLists()
    {
        async function trigger()
        {
            try
            {
                const teachersList = await teachers.find({});
                var arr = [];
                for (const Teacher of teachersList)
                {
                    const temp = teacher.parseTeacherByJson(Teacher);
                    arr.push(temp);
                }
                return arr;
            }
            catch (error) {console.error("Error:", error); return null;}
        }
        return await trigger();
    }

    //根据id返回对应的Teacher 异步方法
    static async getTeacherById(teacherId)
    {
        async function trigger()
        {
            try
            {
                const returnTeacher = await teachers.findOne({id:teacherId});
                return teacher.parseTeacherByJson(returnTeacher);
            }
            catch (error) {console.error(error); return null;}
        }
        return await trigger();
    }

    //根据名称来返回老师 异步方法
    static async getTeacherByName(teacherName)
    {
        async function trigger()
        {
            try
            {
                const returnTeacher = await teachers.findOne({name:teacherName});
                return teacher.parseTeacherByJson(returnTeacher);
            }
            catch (error) {console.error(error); return null;}
        }
        return await trigger();
    }

    //根据类型返回老师 异步方法
    static async getTeacherByType(typeName)
    {
        async function trigger()
        {
            try
            {
                const allTeachers = await teacher.getTeacherLists();
                if (allTeachers != null)
                {
                    var returnTeachers = [];
                    for (let i = 0; i < allTeachers.length; i++)
                    {
                        if (allTeachers[i].teacherType.includes(typeName))
                            returnTeachers.push(allTeachers[i]);
                    }
                    return returnTeachers;
                }
                else return null;
            }
            catch (error) {console.error("Error:", error); return null;}
        }
        return await trigger();
    }

    //显示精准搜索的关键词提示 异步方法
    static async getSearchSuggestion(keyWord)
    {
        async function trigger()
        {
            try
            {
                //先获取所有的Teacher:
                const teacherList = await teacher.getTeacherLists();
                var returnList = [];
                if (teacherList != null)
                {
                    for (let i = 0; i < teacherList.length; i++)
                    {
                        if (teacherList[i].name.indexOf(keyWord) >= 0)
                            returnList.push(teacherList[i].name);
                    }
                    return returnList;
                }
                else return null;
            }
            catch (error) {console.log(error); return null;}
        }
        return await trigger();
    }

    //添加老师到服务器 异步方法
    async addTeacherToServer()
    {
        const saveThis = this;
        async function trigger()
        {
            try
            {
                //先获取所有的Teacher:
                const teacherList = await teacher.getTeacherLists();
                if (teacherList != null)
                {
                    //因为在await teacher.getTeacherLists()已经关闭了服务器，所有我们需要再次连接
                    
                    var nameList = [], idList = [];
                    for (let i = 0; i < teacherList.length; i++)
                    {
                        nameList.push(teacherList[i].name);
                        idList.push(teacherList[i].id);
                    }
                
                    if (nameList.includes(saveThis.name)) {console.log("该教师已经被定义"); return false;}
                    else
                    {
                        //防止id重名
                        var newId = idList[idList.length - 1] + 1;
                        for (let i = 0; i < idList.length - 1; i++)
                        {
                            if (idList[i + 1] - idList[i] !== 1)
                            {
                                newId = idList[i] + 1;
                                break;
                            }
                        }
                        const newTeacher = new teachers({
                            name: saveThis.name,
                            id: newId,
                            avatarsUrl: saveThis.avatarsUrl,
                            teacherType: saveThis.teacherType,
                            classesId: saveThis.classesId
                        });
                        // 保存数据实例到数据库
                        await newTeacher.save().then((result) => {return true;}).catch((error) => {
                            console.error(error);
                            return false;
                        });
                    }
                }
                else return false;
            }
            catch (error) {console.log(error); return false;}
        }
        return await trigger();
    }

    //从服务器删除老师 异步方法
    static async removeTeacherById(teacherId)
    {
        async function trigger()
        {
            try
            {
                await teachers.findOne({id:teacherId}).deleteOne().then((result) => {}).catch((error) => {
                    console.error(error);
                    return false;
                });
            }
            catch (error) {console.error("Error:", error); return false;}
        }
        return await trigger();
    }

    //从服务器删除老师 异步方法
    static async removeTeacherByName(teacherName)
    {
        async function trigger()
        {
            try
            { 
                await teachers.findOne({name:teacherName}).deleteOne().then((result) => {}).catch((error) => {
                    console.error(error);
                    return false;
                });
            }
            catch (error) {console.error("Error:", error); return false;}
        }
        return await trigger();
    }

    //更改老师的信息 异步方法
    async updateTeacherById(teacherId)
    {
        const saveThis = this;
        async function trigger()
        {
            try
            {          
                const newTeacher = new teachers({
                    name: saveThis.name,
                    id: saveThis.id,
                    avatarsUrl: saveThis.avatarsUrl,
                    teacherType: saveThis.teacherType,
                    classesId: saveThis.classesId
                });
                // 保存数据实例到数据库
                await newTeacher.save().then((result) => {return true;}).catch((error) => {
                    console.error(error);
                    return false;
                });
            }
            catch (error) {console.error("Error:", error); return false;}
        }
        return await trigger();
    }

    //更改老师的信息 异步方法
    async updateTeacherByName(teacherName)
    {
        const saveThis = this;
        async function trigger()
        {
            try
            {
                const newTeacher = new teachers({
                    name: saveThis.name,
                    id: saveThis.id,
                    avatarsUrl: saveThis.avatarsUrl,
                    teacherType: saveThis.teacherType,
                    classesId: saveThis.classesId
                });
                // 保存数据实例到数据库
                await newTeacher.save().then((result) => {return true;}).catch((error) => {
                    console.error(error);
                    return false;
                });
            }
            catch (error) {console.error("Error:", error); return false;} 
        }
        return await trigger();
    }

    //以Json的格式向外界输出
    toJson()
    {
        var jsonCode =
        {
            "name": this.name,
            "id": this.id,
            "avatarsUrl": this.avatarsUrl,
            "teacherType": this.teacherType.map(classId => classId.toString()),
            "classes": this.classesId.map(classId => classId.toString())
        };
        return JSON.stringify(jsonCode);
    }

    //以String的类型输出
    toString()
    {
        var string = "";
        string += "教师名称: " + this.name + "\n";
        string += "教师ID: " + this.id + "\n";
        string += "教师头像: " + this.avatarsUrl + "\n";
        string += "教师类型: " + this.teacherType + "\n";
        string += "教授课程ID: " + this.classesId + "\n";
        return string;
    }
}

module.exports = teacher;
