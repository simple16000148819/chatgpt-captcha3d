
![Logo](./public/favicon.ico)

<p align="center">
  <img src="./public/sample-gpt.png" alt="chatgpt" width="49%" />
  <img src="./public/sample-mine.png" alt="我的实现" width="49%" />
</p>



# chatgpt-captcha3d

<video width="100%" controls autoplay>
  <source src="./public/sample.mp4" type="video/mp4">
</video>


近期使用ChatGPT频繁出现图形验证码真的很烦躁!!! 
but这个图形验证码挺有意思的(你从未见过的全新版本)
那就借助GPT自己高仿一下验证码组件吧!


## 实现思路

1.使用canvas绘制随机图标路径贴图
2.使用threejs绘制3d场景转为图片
3.后端使用

```bash
# npm
npm install 

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
