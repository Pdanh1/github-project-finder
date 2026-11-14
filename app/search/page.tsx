'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Results from '../search-results';

function SearchContents() {
  const params = useSearchParams();
  return <Results filters={{
    q: params.get('q') || '', category: params.get('category') || '',
    subcategory: params.get('subcategory') || '', tag: params.get('tag') || '',
  }} />;
}

export default function SearchPage() {
  return <Suspense fallback={<div className="page-loading">正在加载项目…</div>}><SearchContents /></Suspense>;
}
