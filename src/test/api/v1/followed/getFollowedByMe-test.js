'use strict';

const expect = require('chai').expect;
const Chance = require('chance');

const getLoggedinAgentWithUser = require('../../../util/agent.js').getLoggedinAgentWithUser;
const api = require('../../../util/api.js').api;
const clearDb = require('../../../util/clearDb.js').clearDb;

const UserDao = require('../../../../dal/user/userDao.js').UserDao;
const FollowDao = require('../../../../dal/follow/followDao.js').FollowDao;

const chance = new Chance();
const username = chance.first();
const username1 = chance.last();

describe('my followers', () => {
  before(function() {
    return clearDb().then(() => {
      return getLoggedinAgentWithUser();
    })
    .then(({ agent, user }) => {
      this.agent = agent;
      this.user = user;

      return UserDao.create({
        username,
      });
    }).then((user) => {
      this.userIFollow1 = user;
      return UserDao.create({
        username: username1,
      });
    })
    .then((user) => {
      this.userIFollow2 = user;
      return FollowDao.create({
        followedUser: UserDao.getId(this.userIFollow1),
        followerUser: UserDao.getId(this.user),
      });
    })
    .then((follow1) => {
      this.follow = follow1;
      return FollowDao.create({
        followedUser: UserDao.getId(this.userIFollow2),
        followerUser: UserDao.getId(this.user),
      });
    })
    .then((follow2) => {
      this.follow2 = follow2;
    });
  });

  it('should list users followed by me', function() {
    return this.agent.get(api.listFollowedByMe(UserDao.getId(this.user))).expect(200)
    .then((res) => {
      expect(res.body).to.be.ok;
      expect(res.body.data).to.have.property('count', 2);
      expect(res.body.data.followedUsers.length).to.equal(2);
    });
  });

  it('should list 1 users followed by me', function() {
    return this.agent.get(api.listFollowedByMe(UserDao.getId(this.user), { limit: 5, skip: 1 })).expect(200)
    .then((res) => {
      expect(res.body).to.be.ok;
      expect(res.body.data).to.have.property('count', 2);
      expect(res.body.data.followedUsers.length).to.equal(1);
    });
  });
  it('should list 0 users followed by me', function() {
    return this.agent.get(api.listFollowedByMe(UserDao.getId(this.user), { limit: 5, skip: 2 })).expect(200)
    .then((res) => {
      expect(res.body).to.be.ok;
      expect(res.body.data).to.have.property('count', 2);
      expect(res.body.data.followedUsers.length).to.equal(0);
    });
  });
});
