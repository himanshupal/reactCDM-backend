const { addAttendence } = require(`./mutation/addAttendence`),
  { getAttendence } = require(`./query/getAttendence`),
  { addStudent } = require(`./mutation/addStudent`),
  { getStudent } = require(`./query/getStudent`),
  { addClass } = require(`./mutation/addClass`),
  { getClass } = require(`./query/getClass`);

module.exports = {
  Query: {
    getClass,
    getStudent,
    getAttendence
  },
  Mutation: {
    addClass,
    addStudent,
    addAttendence,
  },
};
