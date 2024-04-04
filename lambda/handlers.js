// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.

// Alexa SDK
const Alexa = require('ask-sdk');

// Import helper functions and data
const constants = require('./constants.js');
const util = require('./util.js')

module.exports = {
    /**
     * Handler for when a skill is launched. Delivers a response based on if a user is new or
     * returning.
     */
    LaunchHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'LaunchRequest';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info('LaunchRequest');

            // Determine if the user is new or returning and build a welcome speakOutput.
            let speakOutput = sessionAttributes[constants.FIRST_RUN] ? 
            requestAttributes.t('PROMPT_WELCOME_LONG') : requestAttributes.t('PROMPT_WELCOME_BACK');
            speakOutput = `${speakOutput} ${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('LAUNCH_PROMPT')}`;
            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('LAUNCH_PROMPT')}`;

            console.log("speakOutput: " + speakOutput);
            console.log("repromptOutput: " + repromptOutput);

            sessionAttributes[constants.STATE] = constants.STATES.MENU;

            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');         
            
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.LOBBY),
                            "text": "Welcome to Senior Living Smart Property demo skill.",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, start my day.\""
                        }
                    }
                }); 
            } 

            return responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
        }
    },

    /**
     * Central handler for the AMAZON.StopIntent and AMAZON.CancelIntent.
     * Handler saves the session to DynamoDB and then sends a goodbye speakOutput.
     */
    CancelAndStopIntentHandler: {
        canHandle(handlerInput) {
            return ['AMAZON.CancelIntent','AMAZON.StopIntent'].includes(util.parseIntent(handlerInput));
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, AMAZON.StopIntent`);
            util.saveUser(handlerInput, sessionAttributes, 'persistent');

            let speakOutput = requestAttributes.t('GOODBYE');
         
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');         
            
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.GOODBYE),
                            "text": "Have a great day!",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, give me the news.\""
                        }
                    }
                });
                
            } 

            return responseBuilder
            .withShouldEndSession(true)
            .speak(speakOutput)
            .getResponse();
        }
    },

    /**
     * Central handler for the SessionEndedRequest when the user says exit
     * or another session ending event occurs. Handler saves the session to
     * DynamoDB and exits.
     */
    SessionEndedRequestHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'SessionEndedRequest';
        },
        handle(handlerInput) {
            console.info(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
            return handlerInput.responseBuilder.withShouldEndSession(true).getResponse();
        }
    },

    /**
     * Catch all for when the skill cannot find a canHandle() that returns true.
     */
    UnhandledIntentHandler: {
        canHandle() {
            return true;
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, Unhandled`);

            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
            let speakOutput = `${requestAttributes.t('PROMPT_FALLBACK')} `;

            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');         
            
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.LOBBY),
                            "text": "Welcome to Senior Living Smart Property demo skill.",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, start my day.\""
                        }
                    }
                });
                
            } 

            let bEndSession = false;
            if(Alexa.isNewSession(handlerInput.requestEnvelope)) {
                bEndSession = true;
            }
            else {
                responseBuilder.reprompt(repromptOutput);
                speakOutput = speakOutput + " " + repromptOutput;
            }
            return responseBuilder
            .withShouldEndSession(bEndSession)
            .speak(speakOutput)
            .getResponse();
        }
    },

    /**
     * Central error handler
     */
    ErrorHandler: {
        canHandle() {
            return true;
        },
        handle(handlerInput, error) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();

            console.error(`Error handled: ${error.speakOutput}`);
            console.error('Full error: ', error);

            let repromptOutput = `${requestAttributes.t('PROMPT_MAIN_MENU')} ${requestAttributes.t('PROMPT_WHAT_CAN_I_HELP')}`;
            let speakOutput = `${requestAttributes.t('PROMPT_ERROR')} `;

            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){   
                let template = require('./apl/headline.json');         
            
                // Add the RenderDocument directive to the response
                handlerInput.responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    document: template.document,
                    datasources: {
                        "headlineTemplateData": {
                            "backgroundImage": util.getS3PreSignedUrl(constants.IMAGES.LOBBY),
                            "text": "Welcome to Senior Living Smart Property demo skill.",
                            "sub": " ",
                            "logoUrl": "",
                            "hintText": "Try, \"Alexa, start my day.\""
                        }
                    }
                });
                
            } 

            let bEndSession = false;
            if(Alexa.isNewSession(handlerInput.requestEnvelope)) {
                bEndSession = true;
            }
            else {
                responseBuilder.reprompt(repromptOutput);
                speakOutput = speakOutput + " " + repromptOutput;
            }
            return responseBuilder
            .withShouldEndSession(bEndSession)
            .speak(speakOutput)
            .getResponse();
        }
    },
};
