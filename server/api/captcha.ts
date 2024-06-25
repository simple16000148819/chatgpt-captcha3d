import puppeteer, {Page} from "puppeteer";
import { timeout } from "~/utils";

//node headless浏览器渲染验证码图片
export default defineEventHandler(async (event) => {

    let ts = Date.now();
    function logTime(tip:string){
        console.log(`${tip}耗时`,Date.now()-ts);
        ts = Date.now();
    }

    const browser = await puppeteer.launch({ headless : true });
    const page = await browser.newPage();

    await page.goto('http://localhost:3000/safe');
    logTime('打开页面')
    let ret:any
    page.on('console', (msg:any) => {
        try{
            const call = JSON.parse(msg.text())
            if(!call?.event)return;
            console.log('捕获事件',call.event)
            switch (call.event){
                case 'task-suc':
                    ret = call.data;
                    break;
            }
        }catch (e){

        }
    });

    let time = 0
    while (!ret){
        await timeout(50);
        time+=50;
        if(time>=5000){
            await browser.close()
            return ;//生成超时
        }
    }
    logTime('生成成功')
    await browser.close()
    logTime('关闭浏览器')



    event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8');
    event.node.res.statusCode = 200;
    return ret;
})
