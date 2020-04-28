const { addAttendence } = require(`./mutation/addAttendence`),
  { getAttendence } = require(`./query/getAttendence`),
  { addTeacher } = require(`./mutation/addTeacher`),
  { addStudent } = require(`./mutation/addStudent`),
  { addSubject } = require(`./mutation/addSubject`),
  { getTeacher } = require(`./query/getTeacher`),
  { getStudent } = require(`./query/getStudent`),
  { addClass } = require(`./mutation/addClass`),
  { getClass } = require(`./query/getClass`);

module.exports = {
  Query: {
    getClass,
    getStudent,
    getTeacher,
    getAttendence
  },
  Mutation: {
    addClass,
    addStudent,
    addSubject,
    addTeacher,
    addAttendence,
  },
};
