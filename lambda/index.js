// Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmzncustomIntentsHandlers-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/acustomIntentsHandlers/

/* CONSTANTS */
const Alexa = require('ask-sdk');
const AWS = require("aws-sdk");
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const config = require('./config');
const constants = require('./constants');

// Files for each of the handlers
const handlers = require('./handlers');
const customIntentsHandlers = require('./custom-intents-handlers.js');

// i18n library dependency, we use it below in a localization interceptor
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
// i18n strings for all supported locales
const languageStrings = {
    'en-US': require('./languages/en-US.js')
};

// This request interceptor will bind a trancustomIntentsHandlersation function 't' to the handlerInput
const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings,
        });
        localizationClient.localize = function localize() {
            const args = arguments;
            const values = [];
            for (let i = 1; i < args.length; i += 1) {
                values.push(args[i]);
            }
            const value = i18n.t(args[0], {
                returnObjects: true,
                postProcess: 'sprintf',
                sprintf: values,
            });
            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)];
            }
            return value;
        };
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        requestAttributes.t = function translate(...args) {
            return localizationClient.localize(...args);
        };
    },
};

/**
 * If this is the first start of the skill, grab the room's data from data store and
 * set the session attributes to the persistent data.
 */
const GetUserDataInterceptor = {
    process(handlerInput) {
        const { requestEnvelope, attributesManager } = handlerInput;
        console.log('Request: ', JSON.stringify(handlerInput));
        if (requestEnvelope.session && requestEnvelope.session.new === true) {
            return new Promise((resolve, reject) => {
                attributesManager
                    .getPersistentAttributes()
                    .then(attributes => {
                        console.info('Initializing the user data from data store.')
                        if (attributes[constants.FIRST_RUN] === undefined) {
                            // Set the starting attributes for new room
                            console.log("First run is true");
                            attributes[constants.FIRST_RUN] = true;
                        }

                        attributesManager.setSessionAttributes(attributes);
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        }
    }
};

const LogRequestInterceptor = {
	process(handlerInput) {
        console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
	}
};

const LoggingResponseInterceptor = {
    process(handlerInput) {
        console.log(`RESPONSE ENVELOPE = ${JSON.stringify(handlerInput.response)}`);
    }
};


function getPersistenceAdapter(tableName) {
    return new ddbAdapter.DynamoDbPersistenceAdapter({
      tableName: tableName,
      createTable: false,
      dynamoDBClient: new AWS.DynamoDB({apiVersion: 'latest', region: config.DYNAMODB_PERSISTENCE_REGION})
    });
  }

/* Lambda Setup for custom handler */
exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(getPersistenceAdapter(config.TABLE_NAME))
    .addRequestHandlers(
        handlers.LaunchHandler,
        handlers.CancelAndStopIntentHandler,
        customIntentsHandlers.ToiletingIntentHandler,
        customIntentsHandlers.TalkIntentHandler,
        customIntentsHandlers.SymptonsIntentHandler,
        customIntentsHandlers.PainIntentHandler,
        customIntentsHandlers.MedicationIntentHandler,
        customIntentsHandlers.MobilityIntentHandler,
        customIntentsHandlers.FallIntentHandler,
        customIntentsHandlers.HelpGeneralIntentHandler,
        customIntentsHandlers.BloodPressureIntentHandler,
        customIntentsHandlers.StartMyDayIntentHandler,
        customIntentsHandlers.RoomServiceIntentHandler,
        customIntentsHandlers.MaintenanceIntentHandler,
        customIntentsHandlers.CalendarEventInfoIntentHandler,
        customIntentsHandlers.MenuInfoIntentHandler,
        customIntentsHandlers.ServicesIntentHandler,
        handlers.SessionEndedRequestHandler,
        handlers.CFIRAboutIntentHandler,
        handlers.UnhandledIntentHandler
    )
    .addErrorHandlers(handlers.ErrorHandler)
    .addRequestInterceptors(
        GetUserDataInterceptor, LocalizationInterceptor, LogRequestInterceptor)
    .addResponseInterceptors(LoggingResponseInterceptor)
    .lambda();