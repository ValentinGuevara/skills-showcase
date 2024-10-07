import * as chai from 'chai';
import supertest from 'supertest';
import { describe, it, beforeEach, afterEach } from 'mocha';
import app from '../src/app';
import sinon from 'sinon';
import { gameRepository } from '../src/repositories/gameRepository';
import openAIService from '../src/services/openai';
import { randomUUID } from 'node:crypto';
import { Game, gameAttributes, RULES } from '../src/models/game';
import { EntityId } from 'redis-om';
import { getTimeLimitMs } from '../src/utils/date';
import rabbitmqClient from '../src/config/rabbitmqClient';

const request = supertest(app);
const { expect } = chai;

const GENERATED_ID = randomUUID();
const NUMBER_GENERATED = Math.floor(Math.random() * 1000) + 31; // Generated range [31;]
const MOCKED_VALUE: Game = {
    [gameAttributes.userId]: GENERATED_ID,
    [gameAttributes.numberToGuess]: NUMBER_GENERATED,
    [gameAttributes.tries]: [],
    [gameAttributes.gameStartedAt]: new Date().toISOString()
  };
const BLANK_HINT_SENTENCE = "BLANK MESSAGE";

  describe('GuesserController', () => {
    let stubSearch: sinon.SinonStub, stubSave: sinon.SinonStub, stubPromptOpenAI: sinon.SinonStub, stubRabbitMQ: sinon.SinonStub;
    beforeEach(() => {
      stubPromptOpenAI = sinon.stub(openAIService, "promptMyGPT");
      stubPromptOpenAI.returns(BLANK_HINT_SENTENCE);
      stubRabbitMQ = sinon.stub(rabbitmqClient, "sendBrokerMessage");
      stubRabbitMQ.returns({});

      stubSearch = sinon.stub(gameRepository, "search");
      stubSave = sinon.stub(gameRepository, "save");
      sinon.stub(gameRepository, "remove").returns(Promise.resolve());
      stubSave.returns(MOCKED_VALUE);
    });
    afterEach(() => {
      MOCKED_VALUE[gameAttributes.tries] = [];
      sinon.restore();
    });
    describe('PUT /startNew', () => {
      it('should fail with input error', async () => {
        const params = {
            fakeKey: GENERATED_ID
        };
        stubSearch.returns({
          where: sinon.stub().returns({
              equals: sinon.stub().returns({
                  return: {
                      all: sinon.stub().returns([])
                  }
              })
          })
        } as unknown);
        const res = await request
            .put('/api/startNew')
            .send(params);
        const body = res.body;
        expect(res.status).to.equal(400);
        expect(body.reason).to.includes("invalid_type");
      });
      it('should return existing game if already created', async () => {
        const params = {
            userId: GENERATED_ID
        };
        const generatedEntityId = randomUUID();
        stubSearch.returns({
          where: sinon.stub().returns({
              equals: sinon.stub().returns({
                  return: {
                      all: sinon.stub().returns([{[EntityId]: generatedEntityId, ...MOCKED_VALUE}])
                  }
              })
          })
        } as unknown);
        const res = await request
            .put('/api/startNew')
            .send(params);
        const body = res.body;
        expect(res.status).to.equal(409);
        expect(body.runningGame).to.equal(generatedEntityId);
      });
      it('should return new game created', async () => {
        const params = {
            userId: GENERATED_ID
        };
        stubSearch.returns({
          where: sinon.stub().returns({
              equals: sinon.stub().returns({
                  return: {
                      all: sinon.stub().returns([])
                  }
              })
          })
        } as unknown);
        const res = await request
            .put('/api/startNew')
            .send(params);
        const body = res.body;
        expect(res.status).to.equal(201);
        expect(body[gameAttributes.userId]).to.equal(params.userId);
        expect(body[gameAttributes.numberToGuess]).to.be.undefined;
        expect(body[gameAttributes.tries]).to.be.lengthOf(0);
        expect(body[gameAttributes.gameStartedAt]).to.exist;
      });
    });
    describe('POST /suggestSolution', () => {
      it('should fail with input error', async () => {
        const params = {
          userId: GENERATED_ID,
          suggestion: 1002 // > 1000
      };
        const res = await request
            .post('/api/suggestSolution')
            .send(params);
        const body = res.body;
        expect(res.status).to.equal(400);
        expect(body.reason).to.includes("too_big");
      });
      it('should fail if game not existing', async () => {
        const params = {
          userId: GENERATED_ID,
          suggestion: NUMBER_GENERATED - 12 // FAIL FOR SURE
        };
        stubSearch.returns({
          where: sinon.stub().returns({
              equals: sinon.stub().returns({
                  return: {
                      all: sinon.stub().returns([])
                  }
              })
          })
        } as unknown);
        const res = await request
            .post('/api/suggestSolution')
            .send(params);
        const body = res.body;
        expect(res.status).to.equal(404);
        expect(body.reason).to.equal("NO_CURRENT_GAME");
      });
      it('should fail if game date ended', async () => {
        const paramsDate = {
          userId: GENERATED_ID,
          suggestion: NUMBER_GENERATED
        };
        const msToBeLate = getTimeLimitMs() + 1000; // Add one second to be late
        stubSearch.returns({
          where: sinon.stub().returns({
              equals: sinon.stub().returns({
                  return: {
                      all: sinon.stub().returns([{
                        ...MOCKED_VALUE,
                        [gameAttributes.gameStartedAt]: new Date(Date.now() - msToBeLate).toISOString()
                      }])
                  }
              })
          })
        } as unknown);
        const res = await request
            .post('/api/suggestSolution')
            .send(paramsDate);
        const body = res.body;
        expect(res.status).to.equal(410);
        expect(body.reason).to.equal("TOO_LATE");
      });
      it('should fail if too many try', async () => {
        const paramsDate = {
          userId: GENERATED_ID,
          suggestion: NUMBER_GENERATED
        };
        stubSearch.returns({
          where: sinon.stub().returns({
              equals: sinon.stub().returns({
                  return: {
                      all: sinon.stub().returns([{
                        ...MOCKED_VALUE,
                        [gameAttributes.tries]: Array(RULES.TRY_NUMBER).fill({})
                      }])
                  }
              })
          })
        } as unknown);
        const res = await request
            .post('/api/suggestSolution')
            .send(paramsDate);
        const body = res.body;
        expect(res.status).to.equal(400);
        expect(body.reason).to.equal("TOO_MUCH_TRY");
      });
      it('should fail if suggestion is not the solution', async () => {
        const params = {
            userId: GENERATED_ID,
            suggestion: NUMBER_GENERATED - 32 // FAIL FOR SURE
        };
        stubSearch.returns({
          where: sinon.stub().returns({
              equals: sinon.stub().returns({
                  return: {
                      all: sinon.stub().returns([MOCKED_VALUE])
                  }
              })
          })
        } as unknown);
        const res = await request
            .post('/api/suggestSolution')
            .send(params);
        const body = res.body;
        expect(res.status).to.equal(400);
        expect(body.reason).to.equal("FAIL");
        expect(body.message).to.equal(BLANK_HINT_SENTENCE);
      });
      it('should succeed beacause solution found', async () => {
        const params = {
            userId: GENERATED_ID,
            suggestion: NUMBER_GENERATED
        };
        stubSearch.returns({
          where: sinon.stub().returns({
              equals: sinon.stub().returns({
                  return: {
                      all: sinon.stub().returns([MOCKED_VALUE])
                  }
              })
          })
        } as unknown);
        const res = await request
            .post('/api/suggestSolution')
            .send(params);
        const body = res.body;
        expect(res.status).to.equal(200);
        expect(body[gameAttributes.userId]).to.equal(params.userId);
        expect(body[gameAttributes.numberToGuess]).to.equal(params.suggestion);
        expect(body[gameAttributes.tries]).to.be.lengthOf(1);
        expect(body[gameAttributes.gameStartedAt]).to.exist;
      });
    });
  })