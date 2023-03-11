// +----------------------------------------------------------------------
// | 桃心适配雷电云机vip
// +----------------------------------------------------------------------
// | 版本 v1.2
// +----------------------------------------------------------------------
// | 新增 :用id查找未读消息,修复不能删除空名字bug
// | 新增 :用id判断桃心小秘书
// | 新增 :修改bug删除错误
// | 新增 :获取用户名
// |
// +----------------------------------------------------------------------


// 悬浮窗
floatyLogInit()

// 等待无障碍模式权限
auto.waitFor()

floatyLog('脚本已生效')

// 加载回复消息模板
const msgs = loadAnswerMessage()

// 加载打招呼消息模板
const helloMsg = loadHelloMsg()

// 加载关键词模板
const keyWordMsgs = loadKeyWorldMsg()

// 暂停
var isPause = false

const Find_Sign_lab2 = text('动态')

var My_phoneNum 

// 发布动态按钮查找条件
const Find_Sign_sendSituation = className('android.widget.Image').indexInParent(0).depth(11).clickable(true).boundsInside(device.width / 2, device.height / 2, device.width, device.height)

// 选择照片按钮查找条件 
const Find_Sign_choosePhotos = className('android.widget.Image').indexInParent(3).clickable(true)


/** 屏幕分布信息*/
// 菜单栏位置
var menuRect = [0, device.height*4/5, device.width, device.height]

// 桃心中用户列表范围
var userListRect = [0, 280, device.width, 1175]

// 消息中聊天列表范围
var chatListRect = [0, 237, device.width, 1175]

// 聊天控件深度
var chatWidgetDepth = 14



/**文件相关***************************************/ 

// 文件夹路径
const File_Path = '/sdcard/taoxin'

// 初始化文件路径
const File_Path_Init = '/sdcard/taoxin/init.txt'




test()
function test() {
    launchApp('桃心') 
    // init()
    sleep(3000)
    // act_myMenu()
    floatyLog(getMy_userName())
    
}
function getMy_userName(){
    var My_userName = false
    if(!(text('守护').exists()&&text('家族').exists())){
        act_backInChat()
        sleep(2000)
        act_myMenu()
        sleep(2000)
    }
    var headImg = className('android.widget.Image').findOne(10000)
    if(headImg!=null){
        try {
            My_userName = headImg.parent().children()[1].text()
        } catch (error) {
            floatyLog(error)
        }
    }else{
        floatyLog('未找到头像控件')
    }
    return My_userName
}



// main()
function main() {
    openApp()
    init()
    restart(5)
}


/** 
 * 函数区
 * 
 */

// 每隔x分钟重启一次桃心并重新执行,默认10分钟重启一次
function restart(x) {
    if (x == undefined) {
        x = 10
    }
    while (true) {
        thread1 = threads.start(mode1)
        thread1.waitFor()
        sleep(x * 60 * 1000)
        threads.shutDownAll()
        floatyLog('停止所有脚本线程')
        sleep(10000)
        floatyLog('关闭桃心')
        killApp('桃心')
        sleep(3000)
        back()
        sleep(3 * 1000)
        toast('重启软件')
        floatyLog('重启软件')
    }
}

/**初始化模块 */
function init() {
    // 通过初始化文件初始化
    var initFile = initByFile()
    if(initFile){
        floatyLog('通过文件初始化完成')
        // floatyLog('菜单栏位置:', menuRect)
        // floatyLog('用户列表位置:', userListRect)
        // floatyLog('聊天列表位置:', chatListRect)
        // floatyLog('聊天控件depth:', chatWidgetDepth)
        // floatyLog('用户号码:', My_phoneNum)
        return true
    }
    var initData = new Array()

    // 获取桃心菜单栏高度
    var rect1 = [0, 3 * device.height / 4, device.width / 4, device.height]
    var w1 = fliter_boundsInside(text('桃心').find(), rect1)
    if (w1.length > 0) {
        var menuTop = w1[0].parent().parent().bounds().top
        var menuBottom = w1[0].parent().parent().bounds().bottom
        menuRect[1] = menuTop
        menuRect[3] = menuBottom

        initData.push(['menuRect'].concat(menuRect))
        floatyLog('菜单栏位置:', menuRect)
    }
    act_clickTaoXin()
    text('缘分').waitFor()
    sleep(1000)
    // 获取缘分底部高度,即用户列表高度
    var rect2 = [0, 0, device.width / 4, device.height / 4]
    var w2 = fliter_boundsInside(text('缘分').find(), rect2)
    if (w2.length > 0) {
        var listTop = w2[0].parent().parent().bounds().bottom + 20
        userListRect[1] = listTop
        userListRect[3] = menuTop
        initData.push(['userListRect'].concat(userListRect))
        floatyLog('用户列表位置:', userListRect)
    }
    sleep(1000)
    act_clickMsg()
    text('好友').waitFor()
    // 获取消息界面上方消息按钮底部,即消息列表高度
    var rect3 = [0, 0, 3 * device.width / 4, device.height / 4]
    var w3 = fliter_boundsInside(text('消息').find(), rect3)
    if (w3.length > 0) {
        var chatListTop = w3[0].parent().parent().bounds().bottom + 20
        chatListRect[1] = chatListTop
        chatListRect[3] = menuTop - 20
        initData.push(['chatListRect'].concat(chatListRect))
        floatyLog('聊天列表位置:', chatListRect)
    }
    
    // 获取聊天控件深度
    var w4 = textContains('桃心小秘书').boundsInside(0, chatListRect[1], device.width, chatListRect[3]).findOne(20000)
    if (w4 != null) {
        chatWidgetDepth = w4.parent().depth()
        initData.push(['chatWidgetDepth',chatWidgetDepth])
        floatyLog('聊天控件depth:', chatWidgetDepth)
    }
    // 获取
    if (My_phoneNum == undefined) {
        floatyLog('获取用户号码')
        My_phoneNum = getPhoneNum()
        initData.push(['My_phoneNum',My_phoneNum])
    }

    creatInitFile(initData)
    floatyLog('初始化完成')
}

// 加载初始化文件
function loadInitFile(){
    if(files.exists(File_Path_Init)){
        var file_init = open(File_Path_Init)
        floatyLog('加载初始化文件成功')
        res = file_init.read()
        file_init.close()
        var params = new Array()
        var t1 = res.split('\n')

        for (var i = 0; i < t1.length; i++) {
            var t2 = t1[i].split('--')
            params.push(t2)
        }


        return params
    }
    else{
        floatyLog('初始化文件不存在,需重新初始化')
        return false
    }
}

// 创建初始化文件,参数为二维维数组
function creatInitFile(datas) {
    if(files.exists(File_Path_Init)){
        files.remove(File_Path_Init)
    }
    files.createWithDirs(File_Path_Init)
    // if(!files.exists(File_Path_Init)){

    // }
    datas.forEach(data => {
        var line = data[0]
        for(var i = 1;i<data.length;i++){
            line = line+'--'+data[i]
        }
        var line = line+'\n'
        files.append(File_Path_Init,line)
    });
    floatyLog('初始化文件创建成功')
}

// 通过初始化文件初始化
function initByFile(){
    var data = loadInitFile()
    if(data==false){
        return false
    }
    
    for(var i=0;i<data.length;i++){
        switch (data[i][0]) {
            case 'menuRect':
                for(var ii=0;ii<menuRect.length;ii++){
                    menuRect[ii]=data[i][ii+1]
                }
                break;
            case 'userListRect':
                for(var ii=0;ii<userListRect.length;ii++){
                    userListRect[ii]=data[i][ii+1]
                }
                break;
            case 'chatListRect':
                for(var ii=0;ii<chatListRect.length;ii++){
                    chatListRect[ii]=data[i][ii+1]
                }
                break;
            case 'chatWidgetDepth':
                chatWidgetDepth = data[i][1]
                break;
            case 'My_phoneNum':
                My_phoneNum = data[i][1]
                break;
            default:
                break;
        }
    }
    floatyLog('菜单栏位置:', menuRect)
    floatyLog('用户列表位置:', userListRect)
    floatyLog('聊天列表位置:', chatListRect)
    floatyLog('聊天控件depth:', chatWidgetDepth)
    floatyLog('用户号码:', My_phoneNum)
    return true
}




/**模式函数区 */

// 模式一:
function mode1() {
    openApp()

    // 签到
    startSignin()

    // 获取金额
    startGetMoney()
   
    
    mode_sendSituation()
    // 发表动态
    // 自动提现
    startWithdraw()
    // 休息时间
    if (isPuaseTime()) {
        return;
    }
    while (true) {
        while (existNewMsg()) {
            // if(existNewMsg()){
            mode_replyOneMsgWhenNewMsgExist()
        }
        // 当没有新消息的时候进入桃心打招呼,私信聊天
        mode_sayHiAndPrivateChat()
        sleep(1000)
    }
}

// 子模式

// 打开app
function openApp() {
    if (!launchApp("桃心")) {
        floatyLog('未安装桃心,请安装后再执行');
        exit()
    }
    text('桃心').waitFor()
    floatyLog('打开桃心成功')
    sleep(3000)
    // 出现推荐则点击
    if (text('心动的感觉').exists()) {
        // 打招呼
        text('心动的感觉').click()
        return 1
    }
    else {
        return 2
    }
}

// 进入桃心菜单打招呼发私信并返回
function mode_sayHiAndPrivateChat() { 
    // 进入桃心菜单
    act_clickTaoXin()
    sleep(1000)
    if (text("缘分").findOne(20000) != null) {
        floatyLog('进入桃心成功')
    } else {
        floatyLog('进入桃心失败,请检查')
        act_clickTaoXin()
    }
    sleep(1000)
    // 刷新页面
    act_rollDown()
    // 等待刷新完成
    var sign_shuaxin = text('刷新中').boundsInside(userListRect[0], userListRect[1], userListRect[2], userListRect[3])
    for (i = 0; i < 5; i++) {
        if (!sign_shuaxin.exists()) { break }
        sleep(1000)
    }
    // 获取当前用户列表
    var users = getUserInTaoXin()
    floatyLog('找到用户数量', users.length)
    if (users.length != 0) {
        // 点击心动
        // act_xingDong()
        for (var i = 0; i < users.length; i++) {
            try {
                floatyLog('用户昵称:', users[i].children()[1].text())
            } catch (error) {
                floatyLog(error)
                continue
            }
            // 点击详情
            act_clickUserWidget(users[i])
            if (text('私信').findOne(20000) != null) {
                floatyLog('进入详情成功')
            }
            sleep(1000)
            // 点击私信
            act_clickSiXin()
            // 如果10秒没有加载出来
            var buttonSend = text('发送').findOne(10000)
            if(buttonSend==null){
                back()
                sleep(2000)
                act_clickSiXin()
            }
            // 回复消息
            sendMsgByChatRec()
            // 返回用户列表
            act_backInChat()
            if (existNewMsg()) {
                mode_replyOneMsgWhenNewMsgExist()
                act_clickTaoXin()
                sleep(1000)
            }
        }
    }
    else {
        floatyLog('没找到用户')
    }
}

// 有新消息时进入消息栏并回复一条新消息或老消息
function mode_replyOneMsgWhenNewMsgExist() {
    if (!text('好友').exists()) { act_clickMsg() }
    if (text('好友').findOne(10000) != null) {
        floatyLog('进入消息界面成功')
    }
    sleep(1000)
    // 有新消息则回复新消息并删除,没新消息则回复第一个,没有消息则跳出循环
    var newMsg = getMsgUnread()
    if (newMsg[0] == false) { //没有新消息
        floatyLog('没有新消息')
        var ii = Math.floor(Math.random() * helloMsg.length)
        replyFirstAndDel(helloMsg[ii])
        floatyLog('等待刷新完成,最多等10秒')
        shuaXinComp()
    }
    //如果有新消息则回复新消息并删除
    else {
        floatyLog('有新消息')
        var ii = Math.floor(Math.random() * msgs.length)
        replyFirstUnreadAndDel(newMsg[1], msgs[ii])
        floatyLog('等待刷新完成,最多等10秒')
        shuaXinComp()
    }
}

// 等待聊天列表刷新完成,最多10秒
function shuaXinComp() {
    for (i = 0; i < 10; i++) {
        var widget = text('刷新中')
        // .boundsInside(0,0,device.width,device.height/4)
        if (!widget.exists()) {
            floatyLog('刷新完成')
            break
        } else {
            floatyLog('刷新中')
            sleep(1000)
        }
    }
}

// 点进第一个聊天对话框,发送消息并删除
function replyFirstAndDel(msg) {
    var firstWidget = getFirstChatWidget()
    if (firstWidget != false) {
        userId = firstWidget.id()
        realClick(firstWidget)
        floatyLog('进入第一个聊天框')
        sleep(3000)
        if (text('发送').findOne(10000) != null) {
            sendMsgByChatRec(msg) //根据最后一条聊天记录发送消息
            sleep(1000)
            // 返回聊天界面
            act_backInChat()
            text('好友').waitFor()
            floatyLog('返回消息界面成功')
            sleep(1000)
            delById(userId)
        } else {
            // 返回聊天界面
            act_backInChat()
            sleep(1000)
            slipDelById(userId)
        }
    }else{
        floatyLog('没找到第一个聊天对话框')
    }
}

function getUserIdByChatWidget(widget){
    return widget.parent().parent().id()
}


// 在桃心中下拉刷新
function rollDownInTaoxin() {
    buttonTaoxinClick()
    var jiaZai = text('加载更多')
    // 下拉
    text('缘分').waitFor()
    sleep(1000)
    function xiala() {
        swipe(550, 1400, 520, 1830, 520)
    }
    xiala()
    sleep(1500)
    //当没有刷新出新用户的时候继续刷新,最多5次
    for (i = 0; i < 5; i++) {
        if (jiaZai.findOne().bounds().centerY() > device.height) {
            break;
        }
        xiala()
        sleep(1500)
    }
}

// 点进第一个未读消息对话框,发送消息并删除
function replyFirstUnreadAndDel(newMsgWidget, msg) {
    if (newMsgWidget != false) {
        if (newMsgWidget.id() == 30) {
            floatyLog('官方消息,无需理会')
            realClick(newMsgWidget)
            sleep(1000)
            back()
        }
        else {
            var userId = newMsgWidget.id()
            realClick(newMsgWidget)
            floatyLog('进入未读消息聊天框')
            sleep(3000)
            if (text('发送').findOne(10000) != null) {
                sendMsgByChatRec(msg) //根据聊天记录发送消息
                sleep(1000)
                // 返回聊天界面
                act_backInChat()
                text('好友').waitFor()
                floatyLog('返回消息界面成功')
                sleep(2000)
                delById(userId)
            } else {
                // 返回聊天界面
                act_backInChat()
                sleep(1000)
                slipDelById(userId)
            }
        }
    }
}


// 根据聊天记录发送消息
function sendMsgByChatRec(msg) {
    text('发送').waitFor()
    floatyLog('进入聊天框,等待聊天记录加载,最多等10秒')
    textContains('请勿到外部').findOne(10000)
    floatyLog('加载完成')
    sleep(1000)
    msg = 'hello'
    if (msg == undefined) {
        msg = 'hello'
    }
    var buttonSend = text('发送')
    if (!buttonSend.exists()) {
        floatyLog('不在聊天框内,不能获取聊天内容,请检查')
        return false
    }
    // 获取聊天记录
    var chatRec = getChatRec()
    if (chatRec.length == 0) { //聊天记录为空
        //打招呼
        var i = Math.floor(Math.random() * helloMsg.length)
        msg = helloMsg[i]
    }
    else if (chatRec.length == 1) { //只有一条记录
        if (chatRec[chatRec.length - 1][0] == 2) { //我方发送
            if (chatRec[0][2] == true) { //已读
                // 发送'不理我?'
                msg = '不理我?'
            }
            else { //未读
                // 发送,'看到消息记得回我,等你哦~'
                msg = '看到消息记得回我,等你哦~'
            }
        }
        else { //对方发送
            // 根据关键词回复
            msg = getMsgByKeyWord(chatRec[0][1])
        }
    }
    else if (chatRec.length >= 2) { //有2条以上聊天记录
        if (chatRec[chatRec.length - 1][0] == 2) { //最后一条是我方回复
            if (chatRec[chatRec.length - 2][0] == 2) { //倒数第二条我方回复,不做处理
                floatyLog('不再回复')
                return
            } else {//倒数第二条对方回复,发送'不理我了?'
                msg = '不理我了?'
            }
        }
        else { //最后一条聊天是对方
            // 根据关键词回复
            msg = getMsgByKeyWord(chatRec[chatRec.length - 1][1])
        }
    }
    // 发送消息
    sendMsg(msg)
}

function getMsgByKeyWord(chatcon) {
    for (var i = 0; i < keyWordMsgs.length; i++) {
        if (chatcon.indexOf(keyWordMsgs[i][0]) != -1) {
            floatyLog('匹配到关键词:', keyWordMsgs[i][0])
            var ii = Math.floor(Math.random() * keyWordMsgs[i].length)
            if (ii == 0) { ii = ii + 1 }
            return keyWordMsgs[i][ii]
        }
    }
    floatyLog('未发现关键词')
    var x = Math.floor(Math.random() * msgs.length)
    return msgs[x]
}

//签到 
function signIn() {
    act_myMenu()
    var button_signIn = text('立即签到').findOne(10000)
    if (button_signIn != null) {
        floatyLog('需要签到')
        sleep(2000)
        var button_signIn = text('立即签到').findOne(10000)
        realClick(button_signIn)
        floatyLog('点击立即签到')
        // 点击我知道了
        var button_Iknow = text('我知道了').findOne(5000)
        if (button_Iknow != null) {
            sleep(1000)
            realClick(button_Iknow)
            floatyLog('点击我知道了')
        }
        // 点击桃心按钮位置
        sleep(1000)
        click(device.width / 4, menuRect[1])
        floatyLog('点击任意位置')
        act_backInChat()
    }
    else {
        floatyLog('不用签到')
    }
}

// 开始签到根据时间控制 凌晨 00:05 开始
function startSignin() {
    var day = new java.text.SimpleDateFormat("yyyy/MM/dd").format(new Date())
    var curTime = new Date();
    var starttime = new Date(day + ' 5:00');
    var endtime = new Date(day + ' 5:30');
    if (curTime >= starttime && curTime <= endtime) {
        floatyLog('开始签到，当前时间：' + curTime)
        signIn()
        return;
    }
}


/**功能函数 */
// 找到第一个不是桃心小秘书的聊天框控件,如果没有找到返回false
function getFirstChatWidget() {
    text('好友').waitFor()
    sleep(1000)
    var widget = idMatches("[0-9]*").find()
    if (widget.length == 0) {
        floatyLog('没有对话了')
        return false
    }
    for (var i = 0; i < widget.length; i++) {
        if(widget[i].id()!=30){
            floatyLog('第一个用户id:'+widget[i].id())
            return widget[i];
        }
    }
    return false
}


// 返回聊天记录1代表对方说的话,2代表我说的话[1,desc,true]
function getChatRec() {
    text('立刻举报').waitFor()
    floatyLog('开始获取聊天记录')
    // 动态获取聊天depth, 对方说的话和立刻举报depth-1相同
    var leftTextDepth = 0;
    var rigthTextDepth = 0;
    var sign = text('立刻举报').findOne()
    leftTextDepth = sign.depth() - 1;
    rigthTextDepth = sign.depth();
    floatyLog("leftTextDepth: " + leftTextDepth + ", rigthTextDepth: " + rigthTextDepth);
    function filter_depth(data){
        var res = new Array()
        data.forEach(element => {
            if(element.depth()==leftTextDepth||element.depth()==rigthTextDepth){
                res.push(element)
            }
        });
        return res
    }
    var chatRec = new Array()
    var chats = filter_depth(fliter_textNotNull(packageName('com.taoxinshiganyiliugesl.shop').find()))

    for (var i = 1; i < chats.length; i++) {
        var chat = chats[i]
        if (chat.depth() == leftTextDepth && i>1) {
            chatRec.push([1, chat.text(), true])
        }
        if (chat.depth() == rigthTextDepth && i>1) {
            chatRec.push([2, chat.text(), true])
        }
    }
    floatyLog('发现', chatRec.length, '条聊天记录:')
    return chatRec;
}

// 筛选text不为空且不包含丘比特的控件
function fliter_textNotNull(widgets) {
    var newWidgets = new Array()
    for (var i = 0; i < widgets.length; i++) {
        var cond1 = widgets[i].text() != ''
        var cond2 = widgets[i].text() != null
        var cond3 = widgets[i].text() != undefined
        var cond4 = widgets[i].text().indexOf('丘比特') == -1
        if (cond1 && cond2 && cond3 && cond4) {
            newWidgets.push(widgets[i])
        }
    }
    return newWidgets
}

// 筛选desc不为空的控件
function fliter_descNotNull(widgets) {
    var newWidgets = new Array()
    for (var i = 0; i < widgets.length; i++) {
        var cond1 = widgets[i].desc() != ''
        var cond2 = widgets[i].desc() != null
        var cond3 = widgets[i].desc() != undefined
        var cond4 = widgets[i].desc().indexOf('丘比特') == -1
        if (cond1 && cond2 && cond3 && cond4) {
            newWidgets.push(widgets[i])
        }
    }
    return newWidgets
}

// 只发送消息,必须处于对话框中才能用
function sendMsg(msg) {
    checkParse()
    text("发送").className("android.widget.Button").waitFor()
    console.log('进入聊天框成功')
    var black
    var Sensitive
    // 检测最多5次是否发送成功,一次2秒
    for (var t = 0; t < 5; t++) {
        if (setText(msg)) {
            var sendButton = text("发送").className("android.widget.Button").findOne();
            sleep(1000)
            realClick(sendButton)
        }
        // 开启新线程检测是否包含铭感词
        thread1 = threads.start(function () {
            Sensitive = textContains('敏感词').findOne()
        })
        // 开启新线程检测是否被拉入黑名单
        thread2 = threads.start(function () {
            black = textContains('黑名单').findOne()
        })
        thread1.waitFor()
        thread2.waitFor()
        sleep(2000)
        if (text(msg).exists()) {
            return msg;
        }
        else if (black != null) { //被拉入黑名单
            console.log('已被拉入黑名,单直接删除')
            thread1.interrupt()
            thread2.interrupt()
            return false
        }
        else if (Sensitive != null) { //包含铭感词
            console.log('含敏感词:', msg)
            Sensitive = null
            var ii = Math.floor(Math.random() * helloMsg.length)
            msg = msgs[ii]
            thread1.interrupt()
            thread2.interrupt()
        }
        else{
            log('卡住了,直接退出')
            return true
        }
    }
    // 5次都没发送成功
    return false
}

// 返回未读消息控件的id,屏幕内没有新消息则返回false
function getMsgUnread() {
    // 屏幕内消息列表
    var chats = idMatches("[0-9]*").boundsInside(0, chatListRect[1], chatListRect[2], chatListRect[3]).find()
    floatyLog('当前屏幕对话数:'+chats.length)
    var firstUnreadChat = null
    for(var i=0;i<chats.length;i++){
        var headImgs = chats[i].children().find(className('android.widget.Image'))
        if(headImgs.size()>0){
            var headWidget = headImgs.get(0)
            if(headWidget.parent().childCount()>1){
                firstUnreadChat = chats[i]
                try {
                    floatyLog('第', i+1, '个找到未读消息,数量为:', headWidget.parent().children()[1].text())
                } catch (error) {
                    floatyLog(error)
                }
                break
            }
        }else{
            floatyLog('没找到头像控件')
        }
    }

    if(firstUnreadChat!=null){
        return [true,firstUnreadChat]
    }else{
        // 屏幕范围内没有新消息,返回false
        floatyLog('当前屏幕内没有未读消息')
        return [false];
    }
}

// 根据头像返回用户id
function getUserIdByHeadWidget(widget){
    return widget.parent().parent().id()
}

// 通过头像控件获得用户名字
function getNameByUnRead(headWidget) {
    var name
    if (headWidget != false) {
        try {
            name = headWidget.parent().children()[1].children()[0].text()
        } catch (error) {
            floatyLog('控件错误,不存在此用户')
        }
    }
    floatyLog('用户名字:', name)
    return name;
}

// 检测消息菜单是否有未读消息
function existNewMsg() {
    var newMsgSign = textContains('消息').boundsInside(menuRect[0], menuRect[1], menuRect[2], menuRect[3]).findOne(20000)
    if (newMsgSign != null) {
        if (newMsgSign.text() != '消息') {
            try {
                floatyLog('存在新消息', newMsgSign.text())
                return true
            } catch (error) {
                floatyLog(error)
            }

        }
        else {
            floatyLog('没有新消息')
            return false
        }
    }
    else {
        floatyLog('没找到消息菜单')
        return false
    }
}

// 通过聊天框控件获得用户名字
function getNameByChatWidget(chatWidget) {
    let name = ''
    if (chatWidget != false) {
        try {
            name = chatWidget.children()[0].text()
        } catch (error) {
            floatyLog('控件错误,不存在此用户')
        }
    }
    floatyLog('用户名字:', name)
    return name;

}

// 检测10秒是否删除成功
function isDelSuc() {
    var widget = text('删除成功')
    widget.findOne(10000)
    if (widget != null) {
        floatyLog('删除成功')
        return true
    }
    else {
        floatyLog('删除失败')
        return false
    }
}

// 根据用户id长按删除对话框
function delById(userId) {
    checkParse()
    var widget = idEndsWith(userId).findOne(10000)
    if (widget != null) {
        realLongClick(widget)
        floatyLog('长按', userId)
        buttonDel = text('删除选中').findOne(15000)
        if (buttonDel != null) {
            floatyLog('弹出删除选项')
            sleep(2000)
            // 判断是否移动位置
            var ht = widget.bounds().height()/3
            var toId = idMatches("[0-9]*").boundsInside(widget.bounds().left, widget.bounds().top-ht,widget.bounds().right, widget.bounds().bottom+ht).findOne(5000)
            // boundsInside(widget.left,widget.top,widget.right,widget.bottom)
            if (userId == toId.id()) {
                // 判断选中的是否是未读消息
                var temp = toId.children().find(className('android.widget.Image'))
                if (temp.size() > 0) {
                    var headWidget = temp.get(0)
                    if (headWidget.parent().childCount() > 1) {
                        floatyLog('选中未读消息,不删除')
                        var quxiao = text('取消').findOne(4000)
                        realClick(quxiao)
                        return false
                    } else {
                        realClick(buttonDel)
                        floatyLog('点击删除')
                        return true
                    }
                } else {
                    floatyLog('没找到头像控件,不删除')
                    var quxiao = text('取消').findOne(4000)
                    realClick(quxiao)
                    return false
                }
            } else {
                floatyLog('没有选中的聊天框,取消删除')
                var quxiao = text('取消').findOne(4000)
                if(quxiao!=null){
                    realClick(quxiao)
                    return false
                }else{
                    // 判断是否卡在聊天页面
                    var but_send = text('发送').findOne(4000)
                    if (but_send != null) {
                        floatyLog('卡在聊天界面')
                        back()
                        sleep(2000)
                        var quxiao = text('取消').findOne(4000)
                        if (quxiao != null) {
                            realClick(quxiao)
                            return false
                        }
                    }
                }
            }
        } else {
            floatyLog('没有找到删除选项,可能卡在聊天界面')
            sleep(1000)
            var sendBut = className('android.widget.Button').clickable(true).text('发送')
            if (sendBut.exists()) {
                floatyLog('卡在聊天页面,点击返回')
                back()
                sleep(1000)
                var quxiao = text('取消').findOne(4000)
                realClick(quxiao)
                return false
            }
            return true
        }
    }
}


// 根据用户id滑动删除对话框
function slipDelById(userId) {
    checkParse()
    var widget = idEndsWith(userId).findOne(10000)
    if(widget!=null){
        slipWidgetRight(widget)
        floatyLog('滑动', userId)
        var buttonDel = text('删除').findOne(15000)
        if (buttonDel != null) {
            floatyLog('弹出删除选项')
            sleep(1000)
            realClickByXY(device.width - 100, widget.bounds().centerY())
            floatyLog('点击删除')
        } 
        else {
            floatyLog('没有找到删除按钮,可能卡在聊天界面')
            sleep(1000)
            var sendBut = className('android.widget.Button').clickable(true).text('发送')
            if (sendBut.exists()) {
                floatyLog('卡在聊天页面,点击返回')
                back()
                sleep(1000)
                // realClickByXY(device.width - 10, pWidget.bounds().centerY())
                return false
            }
            return false
        }
    }
    else{
        floatyLog('用户不存在:'+userId)
    }
}

// 向左滑动控件
function slipWidgetRight(widget) {
    var fromX = widget.bounds().centerX()
    var fromY = widget.bounds().centerY()
    var toX = widget.bounds().centerX() - 100
    var toY = widget.bounds().centerY()
    var time = 300
    swipe(fromX, fromY, toX, toY, time)
}

// 向右滑动控件
function slipWidgetLeft(widget) {
    var fromX = widget.bounds().centerX()
    var fromY = widget.bounds().centerY()
    var toX = widget.bounds().centerX() - 100
    var toY = widget.bounds().centerY()
    var time = 300
    swipe(toX, toY,fromX, fromY, time)
}

// 桃心中获取屏幕内所有用户控件
function getUserInTaoXin() {
    var users = new Array()
    var widgets = text('心动').boundsInside(device.width / 2, 405, device.width, 2050).find()
    for (var i = 0; i < widgets.length; i++) {
        users.push(widgets[i].parent())
    }
    return users
}

// 文字控件查找条件
let menuTaoxin = text('桃心') //桃心菜单按钮
let yuanFen = text('缘分') //套心中的缘分按钮



/** 原子操作*/
// 打开app
function act_openApp(appName) {
    checkParse()
    if (!launchApp(appName)) {
        floatyLog('未安装', appName, ',请安装后再执行');
        exit()
    }
}

// 点击心动的感觉
function act_clickxindongganjue() {
    checkParse()
    var widget = text('心动的感觉').findOne(3000)
    if (widget != null) {
        realClick(widget)
        return true
    }
    else {
        return false
    }
}

// 点进桃心菜单
function act_clickTaoXin() {
    checkParse()
    var buttonTaoxin = text('桃心').boundsInside(0, menuRect[1], device.width, menuRect[3]).findOne(10000)
    if (buttonTaoxin != null) {
        floatyLog('点击桃心按钮')
        realClick(buttonTaoxin)
        return true
    }
    else {
        floatyLog('没找到桃心按钮')
        return false
    }
}

// 在桃心中上滑,暂时没用
function act_rollUp() {
    checkParse()
    var jiaZai = text('加载更多')
    // 下拉
    text('缘分').waitFor()
    sleep(1000)
    function shangHua() {
        swipe(550, 1930, 440, 800, 520)
    }
    shangHua()
    sleep(1500)
    //当没有刷新出新用户的时候继续刷新,最多5次
    for (i = 0; i < 5; i++) {
        if (jiaZai.findOne().bounds().centerY() > device.height) {
            break;
        }
        shangHua()
        sleep(1500)
    }
}



// 在桃心中下拉刷新
function act_rollDown() {
    checkParse()
    var jiaZai = text('加载更多')
    // 下拉
    text('缘分').waitFor()
    sleep(1000)
    function xiala() {
        swipe(device.width / 2, 2 * device.height / 5, device.width / 2, 4 * device.height / 5, 520)
    }
    xiala()
    sleep(1500)
    //当没有刷新出新用户的时候继续刷新,最多5次
    for (i = 0; i < 5; i++) {
        if (jiaZai.findOne().bounds().centerY() > device.height) {
            break;
        }
        xiala()
        sleep(1500)
    }
}

// 对当前屏幕所有心动打招呼
function act_xingDong() {
    checkParse()
    let rect = [device.width / 2, chatListRect[1], device.width, chatListRect[3]]
    var bt1 = text('心动').find()
    var bt = fliter_boundsInside(bt1, rect)
    var x = bt.length
    for (var i = 0; i < x; i++) {
        realClick(bt[i])
        sleep(1000)
    }
}

// 点进信息菜单
function act_clickMsg() {
    var btn_Msg = textContains('消息').boundsInside(0, menuRect[1], device.width, menuRect[3])
    if (btn_Msg.exists()) {
        realClick(btn_Msg.findOne(10000))
        return true
    }
    else {
        floatyLog('当前屏幕没有消息按钮')
        return false
    }
}

// 通过用户控件进入详情
function act_clickUserWidget(widget) {
    checkParse()
    if (widget.click()) {
        floatyLog('点击进入详情')
    }
    else {
        floatyLog('点击进入详情失败')
    }
}

// 详情中进入私信
function act_clickSiXin() {
    checkParse()
    var btn_si = indexInParent(1).text('私信').findOne(5000)
    if (btn_si != null) {
        if (btn_si.click()) {
            floatyLog('点击私信成功')
            return true
        }
    }
    else {
        floatyLog('没找到私信按钮')
        return false
    }
}

// 聊天界面点击返回直到回到聊天列表或用户列表
function act_backInChat() {
    sleep(1000)
    // 如果个tab都存在认为是返回首页
    while (!(text('桃心').exists() && text('动态').exists()  && text('我').exists())) {
        if (back()) {
            floatyLog('点击返回成功')
            sleep(2000)
        }
    }
}


/**可复用函数 */
// 载入回复消息模板文件
function loadAnswerMessage() {
    var url = 'http://39.109.115.35:8787/upload/document/2023-02-10/63e52aed40593.txt'
    var name = '消息回复模板.txt'
    var path = '/sdcard/消息回复模板.txt'
    // 先删除
    files.remove(path)
    // 后下载
    downloadFile(url, name,'/sdcard/')

    if (files.exists(path)) {
        var msgMode = open(path)
        floatyLog('载入模板成功');
        res = msgMode.read()
        msgMode.close()
        return res.split('--')
    }
    else {
        files.createWithDirs(path)
        floatyLog('模板文件不存在,已重新创建');
    }
}

// 载入打招呼消息模板文件
function loadHelloMsg() {
    var url = 'http://39.109.115.35:8787/upload/document/2023-02-10/63e52afa206b4.txt'
    var name = '招呼消息模板.txt'
    var path = '/sdcard/招呼消息模板.txt'
    // 先删除
    files.remove(path)
    // 后下载
    downloadFile(url, name,'/sdcard/')

    if (files.exists(path)) {
        var msgMode = open(path)
        floatyLog('载入模板成功');
        res = msgMode.read()
        msgMode.close()
        return res.split('--')
    }
    else {
        files.createWithDirs(path)
        floatyLog('模板文件不存在,已重新创建');
    }
}

// 载入关键词回复模板
function loadKeyWorldMsg() {
    var url = 'http://39.109.115.35:8787/upload/document/2023-02-10/63e52ae4902a3.txt'
    var name = '关键词模板.txt'
    var path = '/sdcard/关键词模板.txt'
    // 先删除
    files.remove(path)
    // 后下载
    downloadFile(url, name,'/sdcard/')

    if (files.exists(path)) {
        var msgMode = open(path)
        floatyLog('载入模板成功');
        res = msgMode.read()
        msgMode.close()
        var keyMsg = new Array()
        var t1 = res.split('\n')

        for (var i = 0; i < t1.length; i++) {
            var t2 = t1[i].split('--')
            keyMsg.push(t2)
        }

        return keyMsg
    }
    else {
        files.createWithDirs(path)
        floatyLog('模板文件不存在,已重新创建');
    }
}

function downloadFile(url, name,path) {
    if(path==undefined){
        path = '/sdcard/'
    }
    var res = http.get(url);
    if (res.statusCode != 200) {
        floatyLog('请求失败：' + name);
        return false
    }
    files.writeBytes(path + name, res.body.bytes());
    floatyLog('下载成功：' + name);
    return true
}

// 强行停止app,适用于oppo系列手机
function killApp(appName) {
    let forcedStopStr = ["结束", "停", "强"];
    let packageName = app.getPackageName(appName);//获取应用包名 通过软件名
    if (packageName) {
        app.openAppSetting(packageName);//进入应用设置信息
        text(appName).waitFor();//等待查询到名字出现
        floatyLog(appName, '出现')
        sleep(500)
        for (var i = 0; i < forcedStopStr.length; i++) {
            if (textContains(forcedStopStr[i]).exists()) {//判定关键字是否存在
                floatyLog(forcedStopStr[i], '出现')
                sleep(500);
                let forcedStop = textContains(forcedStopStr[i]).findOne();
                realClick(forcedStop)
                floatyLog('点击', forcedStopStr[i])
                var sure = text("确定")
                sleep(2000)
                if (sure.exists()) {
                    floatyLog('确定按钮出现')
                    sure.click()
                    return true
                }
            }
        }
    }
}

/******************** 获取金额 *************************/


/**
 * 进去个人中心页面
 */
function act_myMenu() {
    checkParse()
    var button_my = text('我').boundsInside(0, menuRect[1], device.width, menuRect[3]).findOne(10000)
    if (button_my != null) {
        floatyLog('进入 我 菜单')
        realClick(button_my)
    }
    else {
        floatyLog('没找到 我 菜单')
    }
}

/**
 * 开始获取金额 根据时间控制 每晚 23:30 - 23:55 开始统计
 */
function startGetMoney() {
    var day = new java.text.SimpleDateFormat("yyyy/MM/dd").format(new Date())
    var curTime = new Date();
    var starttime = new Date(day + ' 23:30');
    var endtime = new Date(day + ' 23:55');

    if (curTime >= starttime && curTime <= endtime) {
        floatyLog('开始获取金额，当前时间：' + curTime)
        mode_getTodayMoney()
        return;
    }
    floatyLog('没到统计时间，当前时间：' + curTime)
}

/**
 * 开始获取金额 根据时间控制 每晚 23:30 - 23:55 开始统计
 */
function isPuaseTime() {
    var day = new java.text.SimpleDateFormat("yyyy/MM/dd").format(new Date())
    var curTime = new Date();
    // 5点到6点 休息1小时
    var starttime = new Date(day + ' 5:00');
    var endtime = new Date(day + ' 6:00');
    if (curTime >= starttime && curTime <= endtime) {
        floatyLog('休息时间：当前时间：' + curTime)
        return true;
    }
    // 8点到10点 休息2小时   
    var starttime = new Date(day + ' 8:00');
    var endtime = new Date(day + ' 10:00');
    if (curTime >= starttime && curTime <= endtime) {
        floatyLog('休息时间：当前时间：' + curTime)
        return true;
    }

    // 15点到17点 休息2小时  
    var starttime = new Date(day + ' 15:00');
    var endtime = new Date(day + ' 17:00');
    if (curTime >= starttime && curTime <= endtime) {
        floatyLog('休息时间：当前时间：' + curTime)
        return true;
    }

    // 20点到21点 休息1小时  
    var starttime = new Date(day + ' 20:00');
    var endtime = new Date(day + ' 21:00');
    if (curTime >= starttime && curTime <= endtime) {
        floatyLog('休息时间：当前时间：' + curTime)
        return true;
    }
    floatyLog('运行时间，当前时间：' + curTime)
    return false;
}

/**
 * 获取当日收益
 */
function mode_getTodayMoney() {
    act_myMenu();
    text('收益').waitFor()
    floatyLog('进入 我的页 成功')

    // 获取手机号
    if(My_phoneNum == undefined){
        My_phoneNum = getPhoneNum()
    }
    var p_user_mobile = My_phoneNum

    sleep(2000)
    // 回到首页
    act_backInChat()
    text('收益').waitFor()
    floatyLog('进入 我的页 成功')
    sleep(2000)
    realClick(text('收益').findOne())
    textStartsWith('最多可提现').waitFor()
    floatyLog('进入 收益 成功')

    sleep(2000)
    var list = textMatches(/^\d+(\.\d{1,2})?$/).find();
    var size = list.length;
    var money = 0;
    if (size == 2) {
        money = Number(list[1].text());
    }
    floatyLog("可提现: " + money);
    var p_money = money

    sleep(2000)
    realClick(text('提现').findOne())
    text('记录').waitFor()
    floatyLog('进入 提现 成功')

    sleep(2000)
    realClick(text('记录').findOne())
    text('提现记录').waitFor()
    floatyLog('进入 提现 成功')

    sleep(2000)
    var p_time = new java.text.SimpleDateFormat("yyyy-MM-dd").format(new Date())
    // var p_time = '2023-02-09';
    // 匹配当前时间
    var list = textMatches(/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) [0-9]\d:[0-9]\d:[0-9]\d$/).find();
    var size = list.length;
    floatyLog('size: ' + size);
    var sum = 0
    for (var i = 0; i < size; i++) {
        if (list[i].text().indexOf(p_time) != -1) {
            var top = list[i].bounds().top - ((list[i].bounds().bottom - list[i].bounds().top) * 5)
            var bottom = list[i].bounds().top
            var money = className('android.view.View').packageName('com.taoxinshiganyiliugesl.shop').boundsInside(0, top, device.width / 2, bottom).findOne();
            floatyLog('money: ' + money.text().substr(1))
            sum += Number(money.text().substr(1))
        }
    }
    floatyLog('今日提现: ' + sum)
    var p_money_taken = sum

    // 发送数据
    var data = {
        'platform_name': '桃心云',
        'user_name': '',
        'user_id': '',
        'user_mobile': p_user_mobile,
        'money': p_money,
        'money_taken': p_money_taken,
        'time': p_time,
    }

    if (sendBalance(data)) {
        sleep(2000)
        // 回退到主界面
        act_backInChat()
    }
}

/**
 * 发送金额
 */
function sendBalance(data) {
    var url = 'http://39.109.115.35:8787/api/balance/update_balance'
    var res = http.post(url, data);
    try {
        var obj = JSON.parse(res.body.string());
        floatyLog(obj)
        if (res.statusCode == 200 && obj.code == 200) {
            floatyLog('金额发送成功 MSG: ' + obj.msg);
        } else {
            floatyLog('金额发失败 ERROR: ' + obj.msg);
        }
    } catch (e) {
        floatyLog('金额发失败,catch异常: ' + e);
    }
    return true;
}

/**
 * 开始获取金额 根据时间控制 每晚 23:30 - 23:55 开始统计
 */
function startWithdraw() {
    var day = new java.text.SimpleDateFormat("yyyy/MM/dd").format(new Date())
    var curTime = new Date();
    var starttime = new Date(day + ' 8:00');
    var endtime = new Date(day + ' 8:15');

    if (curTime >= starttime && curTime <= endtime) {
        floatyLog('开始自动提现，当前时间：' + curTime)
        mode_auto_withdraw()
        return;
    }

    var starttime = new Date(day + ' 20:00');
    var endtime = new Date(day + ' 20:15');

    if (curTime >= starttime && curTime <= endtime) {
        floatyLog('开始自动提现，当前时间：' + curTime)
        mode_auto_withdraw()
        return;
    }
    floatyLog('没到自动提现时间，当前时间：' + curTime)
}

/**
 * 获取当日收益
 */
function mode_auto_withdraw() {
    // 进入我的
    act_myMenu();
    sleep(2000)
    text('收益').waitFor()
    floatyLog('进入 我的页 成功')

    sleep(2000)
    realClick(text('收益').findOne())
    sleep(2000)
    text('最多可提现').waitFor()
    floatyLog('进入 收益 成功')

    sleep(2000)
    var list = textMatches(/^\d+(\.\d{1,2})?$/).find();
    var size = list.length;
    var money = 0;
    if (size == 2) {
        money = Number(list[1].text());
    }
    floatyLog("可提现: " + money);
    var p_money = money

    sleep(2000)
    realClick(text('提现').findOne())
    text('记录').waitFor()
    floatyLog('进入 提现 成功')
    sleep(2000)

    if (p_money >= 319) {
        var w300 = text('300 元').findOne(2000)
        if (w300 != null) {
            floatyLog('获取提取 300 控件成功')
            sleep(2000)
            floatyLog('自动提现 300 成功')
            realClick(w300)
        } else {
            floatyLog('获取提取 300 控件失败')
        }
    } else if (p_money >= 104) {
        var w100 = text('100 元').findOne(2000)
        if (w100 != null) {
            floatyLog('获取提取 100 控件成功')
            sleep(2000)
            floatyLog('自动提现 100 成功')
            realClick(w100)
        } else {
            floatyLog('获取提取 100 控件失败')
        }
    } else if (p_money >= 54) {
        var w50 = text('50 元').findOne(2000)
        if (w50 != null) {
            floatyLog('获取提取 50 控件成功')
            sleep(2000)
            floatyLog('自动提现 50 成功')
            realClick(w50)
        } else {
            floatyLog('获取提取 50 控件失败')
        }
    } else if (p_money >= 32) {
        var w30 = text('30 元').findOne(2000)
        if (w30 != null) {
            floatyLog('获取提取 30 控件成功')
            sleep(2000)
            floatyLog('自动提现 30 成功')
            realClick(w30)
        } else {
            floatyLog('获取提取 30 控件失败')
        }
    } else if (p_money >= 22) {
        var w20 = text('20 元').findOne(2000)
        if (w20 != null) {
            floatyLog('获取提取 20 控件成功')
            sleep(2000)
            floatyLog('自动提现 20 成功')
            realClick(w20)
        } else {
            floatyLog('获取提取 20 控件失败')
        }
    } else if (p_money >= 11) {
        var w10 = text('10 元').findOne(2000)
        if (w10 != null) {
            floatyLog('获取提取 10 控件成功')
            sleep(2000)
            floatyLog('自动提现 10 成功')
            realClick(w10)
        } else {
            floatyLog('获取提取 10 控件失败')
        }
    } else {
        floatyLog('自动提现失败，金额不够')
    }

    sleep(8000)
    // 回退到主界面
    act_backInChat()
}


/************************发布动态********************************
 */

// 发布动态
function mode_sendSituation() {
    // 发送请求
    var data = requestSituationCom()

    if(data == false){
        return false
    }

    // 清空相册
    // clearCamera()

    // 下载图片
    downloadSituation(data)

    var situationWords = data.title
    if(situationWords==undefined){
        situationWords = '...'
    }

    // 进入状态菜单
    if (!act_menuSituation()) {
        return false
    }
    sleep(3000)

    if (!act_sendSituation()) {
        return false
    }
    floatyLog('点击发布动态按钮')
    sleep(3000)

    if (!act_inputSituation(situationWords)) {
        return false
    }
    floatyLog('输入文字成功')
    sleep(1000)

    if (!act_choosePhotos()) {
        return false
    }
    floatyLog('点击选择照片按钮')
    sleep(3000)

    if (!act_picture()) {
        return false
    }
    floatyLog('点击图片按钮')
    sleep(3000)

    if (!act_chooseFirstPhoto()) {
        return false
    }
    floatyLog('点击第一张图片')
    sleep(3000)

    if (!act_complety()) {
        return false
    }
    floatyLog('点击完成按钮')
    sleep(1000)

    if (!act_release()) {
        return false
    }
    floatyLog('点击发布按钮')

    // 判断最多20秒是否发布成功
    var but_sameity = text('同城').findOne(10000)
    var but_All = text('全部').findOne(10000)
    if(but_sameity!=null&&but_All!=null){
        floatyLog('发布成功')
        sendSituationSuccess()
        return true
    }else{
        floatyLog('发布失败')
        return false
    }

    
}

//  进入动态菜单
function act_menuSituation() {
    checkParse()
    sleep(5000)
    var button_situation = text('动态').boundsInside(0, menuRect[1], device.width, menuRect[3]).findOne(10000)
    if (button_situation != null) {
        floatyLog('进入动态菜单')
        realClick(button_situation)
        var sign = text('全部').findOne(10000)
        if (sign != null) {
            floatyLog('进入状态菜单成功')
            return true
        }
        else {
            floatyLog('进入状态菜单失败')
            return false
        }
    }
    else {
        floatyLog('没找到 动态 菜单')
        return false
    }
}

// 点击发布动态按钮
function act_sendSituation() {
    checkParse()
    var w = Find_Sign_sendSituation.findOne(5000)
    if (w != null) {
        realClick(w)
        return true
    }
    else {
        floatyLog('没找到发布动态按钮')
        return false
    }
}

// 输入动态内容(文字)
function act_inputSituation(words) {
    checkParse()
    return setText(words)
}

// 点击选择照片按钮
function act_choosePhotos() {
    checkParse()
    var w = Find_Sign_choosePhotos.findOne(3000)
    if (w != null) {
        realClick(w)
        return true
    }
    else {
        floatyLog('没找到选择照片按钮')
        return false
    }
}

// 点击图片按钮
function act_picture() {
    checkParse()
    var w = text('图片').findOne(3000)
    if (w != null) {
        realClick(w)
        return true
    }
    else {
        floatyLog('没找到选择图片按钮')
        return false
    }
}

// 点击第一张照片
function act_chooseFirstPhoto() {
    checkParse()
    var w = depth(13).clickable(true).className("android.widget.Image").findOnce(1)
    if (w != null) {
        realClick(w)
        return true
    }
    else {
        floatyLog('没有选中图片')
        return false
    }
}

// 点击完成按钮(完成选择照片)
function act_complety() {
    checkParse()
    var w = textContains('完成').findOne(3000)
    if (w != null) {
        realClick(w)
        return true
    }
    else {
        floatyLog('没有完成按钮')
        return false
    }
}

// 点击发布按钮
function act_release() {
    var w = text('发布').findOne(5000)
    if (w != null) {
        realClick(w)
        return true
    }
    else {
        floatyLog('没有找到发布按钮')
        return false
    }
}

// 清理相册
function clearCamera1() {
    var path = '/sdcard/DCIM/'
    // 删除相册文件
    if(!files.removeDir(path)){
        return false
    }
    // 创建相册文件
    return files.ensureDir(path)
}

// 清理相册
function clearCamera() {
    var path = '/sdcard/DCIM/'
    clearDir(path)
}

// 获取用户电话
function getPhoneNum() {
    act_myMenu();
    text('收益').waitFor()
    floatyLog('进入 我的页 成功')
    // 获取手机号
    realClick(text('系统设置').findOne())
    sleep(2000)
    realClick(text('账号与安全').findOne())
    sleep(2000)
    realClick(text('账号与安全').findOne())
    sleep(2000)
    realClick(text('手机号码').findOne())
    sleep(2000)
    var widget = textMatches(/^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/).findOne();
    floatyLog('获取号码完成'+widget.text())
    var p_user_mobile = widget.text()
    act_backInChat()
    return p_user_mobile
}

// 向服务器请求动态内容
function requestSituationCom() {
    if(My_phoneNum==undefined){
        act_backInChat()
        My_phoneNum = getPhoneNum()
        sleep(3000)
    }
    var url = 'http://39.109.115.35:8787/api/postnews/getnews'
    var data = {
        'platform_name': '桃心',
        'user_mobile': My_phoneNum,
    }
    var res = http.post(url, data);

    try {
        var obj = JSON.parse(res.body.string());
        floatyLog(obj)
        if (res.statusCode == 200) {
            if(obj.code == 200){
                var now = new Date()
                if(now>obj.data.postTime){
                    floatyLog('请求成功,准备发送动态');
                    floatyLog('内容:'+obj.data.title)
                    floatyLog('图片地址:'+obj.data.imageUrl)
                    return obj.data;
                }
                else{
                    floatyLog('请求成功,但未到发送时间');
                }
                
            }
            else{
                floatyLog('已经发送过,无需再发')
            }
        }
    } catch (e) {
        floatyLog('请求失败,catch异常: ' + e);
    }
    return false

}

// 下载动态内容
function downloadSituation(data){
    if(data==false){
        return false
    }
    else{
        var path = '/sdcard/DCIM/'
        var n = new Date()
        n = n.getTime()
        var fileName = n+data.imageUrl.substring(data.imageUrl.lastIndexOf("."))
        // 下载照片到相册
        files.ensureDir(path)
        if(downloadFile(data.imageUrl,fileName,path)){
            // 相册刷新
            media.scanFile('/sdcard/DCIM/' + fileName)
            return true
        }
        else{
            return false
        }
    }
}

// 向服务器发送发布动态成功
function sendSituationSuccess(){
    var url = 'http://39.109.115.35:8787/api/postnews/setNewsStatus'
    var data = {
        'platform_name': '桃心',
        'user_mobile': My_phoneNum,
        'news_status':1,
    }
    var res = http.post(url, data);
    try {
        var obj = JSON.parse(res.body.string());
        floatyLog(obj)
        if (res.statusCode == 200 && obj.code == 200) {
            floatyLog('发送成功 MSG: ' + obj.msg);
            return true;
        } else {
            floatyLog('发送失败 ERROR: ' + obj.msg);
        }
    } catch (e) {
        floatyLog('发送失败,catch异常: ' + e);
    }
    return false

}

// 删除文件夹下所有文件和文件夹
function clearDir(path){
    var path = path
    /*获取path目录下所有文件夹和文件*/
    var arrFile = new Array();
    var arr = files.listDir(path);
    /*遍历文件和文件夹*/
    for (var i = 0; i < arr.length; i++) {
        /*连接路径*/
        newPath = files.join(path, arr[i]);
        /*判断路径类型*/
        if (files.isFile(newPath)) {
            /*过滤隐藏文件*/
            if (arr[i].slice(0, 1) != ".") {
                arrFile.push(newPath);
                // 删除文件夹里面的文件
                if (files.remove(newPath)) {
                    floatyLog('文件缓存清除完成');
                    // 下面这个可以清除app里面的文件缓存
                    app.sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, android.net.Uri.fromFile(java.io.File(newPath))));
                }

            }
        }
    }
}


// 调用接口

/**工具函数(可复用) */

// 绝对值函数
function abs(x) {
    if (x > 0) {
        return x;
    }
    else {
        return -x;
    }
}

// log中显示控件中心位置
function areaToLog(widget) {
    log(abs(widget.bounds().centerX()), abs(widget.bounds().centerY()))
}

// 根据控件bound信息模拟点击控件中心坐标
function realClick(widget) {
    try {
        click(abs(widget.bounds().centerX()), abs(widget.bounds().centerY()))
    } catch (error) {
        floatyLog(error)
    }

}

// 根据控件bound信息模拟点击控件中心坐标
function realClickByXY(x, y) {
    try {
        click(abs(x), abs(y))
    } catch (error) {
        floatyLog(error)
    }
}

// 根据控件bound信息模拟长按控件中心坐标
function realLongClick(widget) {
    checkParse()
    try {
        longClick(abs(widget.bounds().centerX()), abs(widget.bounds().centerY()))
    } catch (error) {
        floatyLog('长按错误', error)
    }
}

// 根据屏幕范围筛选符合条件的控件
function fliter_boundsInside(widgets, rect) {
    var newWidgets = new Array()
    for (var i = 0; i < widgets.length; i++) {
        // floatyLog(widgets[i].bounds().top)
        var cond1 = widgets[i].bounds().left >= rect[0]
        var cond2 = widgets[i].bounds().top >= rect[1]
        var cond3 = widgets[i].bounds().right <= rect[2]
        var cond4 = widgets[i].bounds().bottom <= rect[3]
        if (cond1 && cond2 && cond3 && cond4) {
            newWidgets.push(widgets[i])
        }
    }
    return newWidgets
}


// 暂停,至少一秒
function checkParse() {
    while (true) {
        if (!isPause) {
            break;
        }
        sleep(1000)
    }
}

// 获取所有文本
function getAllText() {
    var texts = new Array()
    var ws = find()
    if (ws != null) {
        for (var i = 0; i < ws.length; i++) {
            var w = ws[i]
            try {
                cond1 = w.text() != ''
                cond2 = w.text() != null
                cond3 = w.text() != undefined
                if (cond1 & cond2 & cond3) {
                    texts.push(w.text())
                }
            } catch (error) {
                // floatyLog(error)
                continue
            }
        }
    }
    return texts
}

// 获取所有包含文本的控件
function getAllTextWidgets() {
    var texts = new Array()
    var ws = find()
    if (ws != null) {
        for (var i = 0; i < ws.length; i++) {
            var w = ws[i]
            try {
                cond1 = w.text() != ''
                cond2 = w.text() != null
                cond3 = w.text() != undefined
                if (cond1 & cond2 & cond3) {
                    texts.push(w)
                }
            } catch (error) {
                // floatyLog(error)
                continue
            }
        }
    }
    return texts
}

// 获取当前时间
function getNowFormatDate() {
    var url = 'https://f.m.suning.com/api/ct.do';
    var res = http.get(url);
    if (res.statusCode == 200) {
        var dataJson = res.body.json();
        // toast(dataJson.currentTime);
        floatyLog('当前时间:', dataJson.currentTime)
        return dataJson.currentTime

    } else {
        toast("fali" + res.statusMessage);
        floatyLog('请检查网络连接')
    }
}





//透明可穿透悬浮日志
function floatyLogInit(linesCount, x, y, islog) {
    importClass(android.view.View);
    let _linesCount = linesCount || 6;
    if (typeof _linesCount != 'number') _linesCount = 6;
    if (typeof x != 'number') x = 0;
    if (typeof y != 'number') y = 10;
    if (typeof islog != 'boolean') islog = true;
    let initX = x
    let initY = y
    let rawWindowStr = '\
    <card w="*" h="auto" marginLeft="3" cardBackgroundColor="#44242424" cardCornerRadius="8dp" cardElevation="1dp" gravity="center_vertical">\
        <vertical  paddingLeft="5" paddingRight="5" w="*">\
            <Chronometer id="chronometer" textSize="13dp" textColor="#FFD700" w="*" style="Widget/AppCompat.Button.Borderless" textStyle="bold"/>\
            <text id="info" text="" textSize="13dp"  textColor="#FFD700" textStyle="bold" layout_width="wrap_content" layout_height="wrap_content" />\
            <button id="log" textSize="13dp" textColor="#FFD700" style="Widget/AppCompat.Button.Borderless"  textStyle="bold"\
                layout_gravity="left" layout_weight="5" layout_width="wrap_content" layout_height="wrap_content" />\
        </vertical>\
    </card>'
    floatyLogW = floaty.rawWindow(rawWindowStr);
    ui.run(() => { floatyLogW.info.setVisibility(View.GONE) })
    let nowlogArr = [];
    floatyLog = function (noLog) {
        let s = '[' + dateFormat(new Date(), "HH:mm:ss") + '] '
        for (let param of arguments) {
            if (param === false) continue;
            s += param + ' ';
        }
        nowlogArr.push(s);

        if (nowlogArr.length > _linesCount) nowlogArr.shift();
        let printContent = nowlogArr.join('\n');
        ui.run(() => { floatyLogW.log.setText(printContent) })
        if (islog && noLog !== false) log(s);
    }

    floatyLogShow = function (x, y) {
        let _x = x || initX
        let _y = y || initY
        ui.run(() => { floatyLogW.setPosition(_x, _y) })
    }

    floatyLogHide = function () {
        ui.run(() => { floatyLogW.setPosition(3000, 3000) })
    }

    floatySetInfo = function (arr) {
        ui.run(() => {
            if (!arr || arr.length <= 0) {
                floatyLogW.info.setVisibility(View.GONE);
            } else {
                let nowInfoArr = [];
                for (let param of arr) nowInfoArr.push(param)
                let infoContent = nowInfoArr.join('\n');
                floatyLogW.info.setText(infoContent)
                floatyLogW.info.setVisibility(View.VISIBLE);
            }
        })
    }

    function dateFormat(date, fmt_str) {
        return java.text.SimpleDateFormat(fmt_str).format(new Date(date || new Date()));
    }
    ui.run(() => {
        try {
            floatyLog("启动日志")
            floatyLogW.chronometer.setFormat('[正在运行] %s')
            floatyLogW.chronometer.start()
            setTimeout(function () {
                floatyLogW.setTouchable(false);
                floatyLogW.setPosition(x, y);
            }, 500);
        } catch (error) {
            floatyLog("--日志--")
        }
    })
    setInterval(() => { }, 1000)
}
