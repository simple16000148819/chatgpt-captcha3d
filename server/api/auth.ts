

//根据验证码id和答案下标 判断是否通过验证
import {captchaCache, errRet, sucRet} from "~/server/utils";

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    if(query?.id&&query?.index&&`${captchaCache.get(query.id)?.sureIndex}`==query.index){
        return sucRet(event,{})
    }else {
        return errRet(event,'验证失败')
    }
})
