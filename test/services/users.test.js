import {expect, assert} from 'chai';
import app from '../../app';
import UserFixtures from '../../model/users/user-fixture.js';
import { getNewUserAccount } from '../../model/users/user-fixture.js';
import RoleFixtures from '../../model/roles/role-fixture.js';
import TeamFixtures from '../../model/teams/team-fixture.js';
import _ from 'lodash';
import dbTestSetup from '../../model/db-test-setup.js';
import UserService from '../../services/user-service.js';
import { getRandomString } from '../helpers/random-helpers.js'
import { fillDbBefore } from '../helpers/db-helpers.js';

describe("when there are users in the DB", function () {
    fillDbBefore();

    it("getUsers, should return all users", function (done) {
        UserService.getUsers(verifyResult);

        function verifyResult(err, result) {
            expect(UserFixtures.length).to.equal(result.length);
            done();
        }
    });

    it(`findById, should return the user`, function (done) {
        var userFixture = getNewUserAccount();
        UserService.findById(userFixture._id)
            .then(function (result) {
                try {
                    expect(result._id).to.deep.equal(userFixture._id);
                    expect(result.email).to.equal(userFixture.email);
                    done()
                }
                catch (e) {
                    done(e)
                }
            })
    });

    it(`updateAccountVerified, should return a user with isVerified === true`, function (done) {
        var userFixture = getNewUserAccount();

        expect(userFixture.isVerified).to.be.false;
        UserService.updateAccountVerified(userFixture._id)
            .then(function (result) {
                try {
                    expect(result.isVerified).to.be.true;
                    done()
                }
                catch (e) {
                    done(e)
                }
            })
    });
});

describe("when no users in database", function () {
    beforeEach(function (done) {
        dbTestSetup.addTeamFixtures(function () {
            dbTestSetup.addRoleFixtures(done)
        })
    });

    afterEach(function (done) {
        dbTestSetup.cleanDb(done);
    });

    it("getting the users should return no users", function (done) {
        UserService.getUsers(verifyResult);

        function verifyResult(err, result) {
            expect(result).to.be.empty;
            expect(err).to.be.null;
            done();
        }
    });

    it("creating a valid user should create a user in the db", function (done) {
        var userName = getRandomString();
        UserService.createUser({
            userName: userName,
            email: "anoer@test.com",
            roleRef: RoleFixtures[0]._id,
            teamRef: TeamFixtures[0]._id,
            pw: getRandomString()
        }, verifyResult);

        function verifyResult(err, result) {
            expect(result._id).not.to.undefined;
            UserService.getUsers(function (err, users) {
                expect(users).not.to.be.empty;
                expect(users[0].userName).to.equal(userName)
            });
            done();
        }
    });

    it("creating an invalid user should return an error", function (done) {
        var userName = getRandomString();
        UserService.createUser({
            userName: userName,
            email: "anoer@test.com",
            teamRef: TeamFixtures[0]._id,
            pw: getRandomString()
        }, verifyResult);

        function verifyResult(err, result) {
            expect(err).not.to.be.null;
            done();
        }
    });

    it("creating a user with an email that already exists should return a duplicate key expection", function (done) {
        var userName = getRandomString();
        var user = {
            userName: userName,
            email: "anoer@test.com",
            roleRef: RoleFixtures[0]._id,
            teamRef: TeamFixtures[0]._id,
            pw: getRandomString()
        };
        UserService.createUser(
            user, createAnotherOne);

        function createAnotherOne(err, result) {
            expect(err).to.be.null;
            UserService.createUser(user, verifyResult)
        }

        function verifyResult(err, result) {
            expect(err).not.to.be.null;
            expect(err.toJSON().errmsg).to.include('duplicate key error');
            done();
        }

    });

    it(`findById, should return an empty result`, function (done) {
        UserService.findById(UserFixtures[0]._id)
            .then(function (result) {
                try {
                    expect(result).to.be.null;
                    done();
                } catch(e) {
                    done(e);
                }
            });
    });
});