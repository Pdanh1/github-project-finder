'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main><h1>项目列表暂时无法加载</h1><button onClick={reset}>重试</button></main>;
}
