import { createAzure } from '@ai-sdk/azure';
import { createProviderRegistry } from 'ai';

export const registry = createProviderRegistry({
    azure: createAzure({
        apiVersion: '2024-12-01-preview',
        apiKey: process.env.AZURE_API_KEY,
    })
});