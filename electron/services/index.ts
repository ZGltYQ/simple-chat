import { getTopics, createTopic, deleteTopic, updateTopic } from '../services/topics';
import { getMessages, createMessage } from '../services/messages';
import { getImagesByMessage, getImagesByTopic, createImage } from '../services/images';
import { startCompletion, stopCompletion, uploadLocalModel } from '../services/llm';
import { getSettings, createSettings, initLLMByConfig, updateSettingsSource } from '../services/settings';
import { getFunctions, getFunction, createFunction, toggleFunction, deleteFunction, updateFunction } from '../services/functions';

export const topics = {
    getTopics,
    createTopic,
    deleteTopic,
    updateTopic
}

export const messages = {
    getMessages,
    createMessage
}

export const images = {
    getImagesByMessage,
    getImagesByTopic,
    createImage
}

export const llm = {
    startCompletion,
    uploadLocalModel,
    stopCompletion
}

export const settings = {
    getSettings,
    createSettings,
    initLLMByConfig,
    updateSettingsSource
}

export const functions = {
    getFunctions,
    getFunction,
    createFunction,
    deleteFunction,
    toggleFunction,
    updateFunction
}