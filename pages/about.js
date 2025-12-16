import React from 'react';
import {
  Container,
  Paper,
  Box,
  Typography // Keep Typography just in case
} from '@mui/material';
import Layout from '../components/layout/Layout';
import { getMarkdownContent } from '../lib/markdown';

export default function About({ contentHtml }) {
  return (
    <Layout title="About - Is the Market Cheap?">
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Render Markdown HTML */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </Paper>

        {/* CSS for Markdown Styles within this div */}
        <style jsx global>{`
          .markdown-content h1 {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 1rem;
            color: inherit;
          }
          .markdown-content h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: inherit;
          }
          .markdown-content p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
            color: inherit;
          }
          .markdown-content strong {
            font-weight: 700;
          }
          .markdown-content a {
            color: #2979FF;
            text-decoration: none;
          }
          .markdown-content a:hover {
            text-decoration: underline;
          }
        `}</style>
      </Container>
    </Layout>
  );
}

export async function getStaticProps() {
  const contentHtml = await getMarkdownContent('about');
  return {
    props: {
      contentHtml
    }
  };
}
