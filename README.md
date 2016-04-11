##graduationProject

毕业设计《基于Node.js与MongoDB的实时医疗监护系统》
Express+Mongoose+Jade
功能其实比较简单，有点对不起题目。 共4种角色：系统管理员、管理员、医生、病人，下面将系统管理员与管理员统称为管理员。
管理员能增删改查医生和病人的用户信息，为医生分配病人，为病人录入家属信息。医生与病人是多对多关系。
医生能接收其监护的病人的事件信息（身体参数异常），医生会对病人的事件进行诊断，也能为自己诊断进行修改。
病人会有各个监控设备（目前有心电图和体温。实际上没有硬件，只是写好接口，然后进行模拟），当监控到参数移除就会向其监护医生推送事件信息和截图。
病人有日历视图，主要是将事件按照时期进行管理。
医生与病人有聊天空能。遗憾的是没有采用WebSocket，之前尝试了一下，但由于时间比较赶，最后采用轮询实现。

线上版本（阿里云ECS）：http://www.codcodog.com/ 或 139.129.27.206     域名是朋友的，阿里云好像7月份就到期了。   
系统管理员帐号与密码：admin + admin  
医生帐号与密码： bingren01 + 123456  
病人帐号与密码： doctor01 + 123456   
