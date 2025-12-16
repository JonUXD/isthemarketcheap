import React from 'react';
import {
    Container,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Layout from '../components/layout/Layout';
import { getFaqContent } from '../lib/markdown';

export default function FAQ({ faqs = [] }) {
    // Defensive check: if faqs is not an array, default to empty
    const safeFaqs = Array.isArray(faqs) ? faqs : [];

    if (!Array.isArray(faqs)) {
        console.warn("FAQ data invalid:", faqs);
    }

    return (
        <Layout title="FAQ - Is the Market Cheap?">
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box>
                    {safeFaqs.map((faq, index) => (
                        <Accordion key={index} sx={{
                            mb: 2,
                            backgroundColor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            '&:before': { display: 'none' }
                        }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon color="primary" />}
                                aria-controls={`panel${index}-content`}
                                id={`panel${index}-header`}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>{faq.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="text.secondary" style={{ whiteSpace: 'pre-line' }}>
                                    {faq.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                    {safeFaqs.length === 0 && (
                        <Typography color="error">
                            No FAQ content found. Please check content/faq.md.
                        </Typography>
                    )}
                </Box>
            </Container>
        </Layout>
    );
}

export async function getStaticProps() {
    try {
        const faqs = getFaqContent();
        return {
            props: {
                faqs: Array.isArray(faqs) ? faqs : []
            }
        };
    } catch (error) {
        console.error("Error fetching FAQ content:", error);
        return {
            props: {
                faqs: []
            }
        };
    }
}
