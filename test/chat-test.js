/*
 * 测试聊天接口，共3个
 * 1、get_chat_record  2、save_chat_record   3、get_talk_people
 *
 *
 */

var superagent = require("superagent");
var assert = require("chai").assert;

var UID = "用户id";
var DID = "聊天对象id";
var LIMIT = 10;
describe("chat api", function() {

    it("get_talk_people api", function(done) {
        superagent.get("http://localhost:3000/get_talk_people?uid=" + UID)
            .end(function(err, res) {
                assert.equal(err, null)
                assert.equal(typeof res.body, "object")
                assert.equal(res.body.status, true)
                assert.equal(res.body.info, "请求成功")
                assert.equal(res.body.userList instanceof Array, true)
                done()
            })
    })

    it("get_chat_record api", function(done) {
        superagent.get("http://localhost:3000/get_chat_record?&patient_id=" + UID + "&doctor_id=" + DID + "&limit=" + LIMIT + "&timestamp=" + 0 + "&firstloadtimestamp=" + Date.now())
            .end(function(err, res) {
                assert.equal(err, null)
                assert.equal(res.body.status, true)
                assert.equal(res.body.info, "获取成功")
                assert.equal(res.body.chatRecordList instanceof Array, true)
                assert.isAtMost(res.body.chatRecordList.length, LIMIT)
                done()
            })
    })

    it("save_chat_record api", function(done) {
        superagent.post("/save_chat_record")
            .send({
                talk_people_id: DID,
                message: "好的，我会按时休息的（测试）"
            })
            .end(function(err, res) {
                assert.equal(err, null)
                assert.equal(res.body.status, true)
                assert.equal(res.body.info, "保存成功")
                assert.equal(res.body.chatRecord instanceof Object, true)
            })
        done()
    })
})
