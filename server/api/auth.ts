

//根据验证码id和答案下标 判断是否通过验证
export default defineEventHandler(async (event) => {
    event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8');
    event.node.res.statusCode = 200;
    return '成功';
})
