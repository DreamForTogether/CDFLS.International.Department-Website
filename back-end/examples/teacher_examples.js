//引入这个类
const teacher = require('./teacher');
const mongoose = require("mongoose");
const connectUrl = "xxxxxxxxxxxxxxxxxxxxxxxxxx";

//创建一个类来输出
//第一种constructor
/*const teacherObject1 = new teacher("test", 0, "cn.bing.com", ["ap"], [0, 1, 2]);
console.log(teacherObject1.toJson());*/

//第二种constructor
/*const jsonString =
`{
    "name": "billy",
    "id": 0,
    "avatarsUrl": "cn.bing.com",
    "teacherType": ["ap"],
    "classesId": [0, 1, 2]
}`;
const teacherObject2 = teacher.parseTeacherByString(jsonString);
console.log(teacherObject2.toJson());*/

//第三种constructor
/*const Json =
{
    "name": "murphy",
    "id": 0,
    "avatarsUrl": "cn.bing.com",
    "teacherType": ["ap"],
    "classesId": [0, 1, 2]
}
const teacherObject3 = teacher.parseTeacherByJson(Json);
console.log(teacherObject3.toJson());*/

//异步方法调用示例
async function runAsyncMethods()
{
    try
    {
        await mongoose.connect(connectUrl);

        const allTeachers = await teacher.getTeacherLists();
        console.log("所有的老师");
        for (let i = 0; i < allTeachers.length; i++)
            console.log(allTeachers[i].toString());

        /*const idTeacher = await teacher.getTeacherById(0);
        console.log("teacherId为0的老师");
        console.log(idTeacher.toString());*/

        /*const newTeacherJson = 
        {
            "name": "Test",
            "id": 0,
            "avatarsUrl": "exsample.com",
            "teacherType": ["alevel"],
            "classesId": [3]
        }
        const newTeacherObject = teacher.parseTeacherByJson(newTeacherJson);
        if(newTeacherObject.addTeacherToServer())
            console.log("成功添加");
        else
            console.log("添加失败");*/

        /*const nameTeacher = await teacher.getTeacherByName("John");
        console.log("所有名称为John的老师:");
        console.log(nameTeacher.toString());*/

        /*const typeTeacher = await teacher.getTeacherByType("ap");
        console.log("所有类型里面有ap的老师:");
        for (let i = 0; i < typeTeacher.length; i++)
            console.log(typeTeacher[i].toString());*/

        /*const suggestionName = await teacher.getSearchSuggestion("张");
        console.log("所有老师里面带有张的老师:");
        for (let i = 0; i < suggestionName.length; i++)
            console.log(suggestionName[i]);*/

        /*if(teacher.removeTeacherById(6))
            console.log("成功删除");
        else
            console.log("删除失败");*/

        /*if (teacher.removeTeacherByName("张其"))
            console.log("成功删除");
        else
            console.log("删除失败");*/

        /*const updateTeacherJson = 
        {
            "name": "john",
            "id": 0,
            "avatarsUrl": "exsample.com",
            "teacherType": ["alevel", "ap"],
            "classesId": [3, 4, 5, 6]
        }
        const updateTeacher = teacher.parseTeacherByJson(updateTeacherJson);
        if(updateTeacher.updateTeacherById(3))
            console.log("成功更改");
        else
            console.log("更改失败");*/

        /*const updateTeacherJson2 = 
        {
            "name": "mars",
            "id": 0,
            "avatarsUrl": "test.com",
            "teacherType": ["alevel", "ap"],
            "classesId": [3, 4, 5]
        }
        const updateTeacher2 = teacher.parseTeacherByJson(updateTeacherJson2);
        if(updateTeacher2.updateTeacherByName("murphy"))
            console.log("成功更改");
        else
            console.log("更改失败");*/
    }
    catch (error) {console.error(error.message);}
}
  
runAsyncMethods();
