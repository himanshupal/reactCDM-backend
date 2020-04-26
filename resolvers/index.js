const { addAttendence } = require(`./mutation/addAttendence`),
  { addStudent } = require(`./mutation/addStudent`),
  { addClass } = require(`./mutation/addClass`),
  { students } = require(`./query/students`),
  { student } = require(`./query/student`),
  { classes } = require(`./query/classes`);

module.exports = {
  Query: {
    classes,
    student,
    students,
  },
  Mutation: {
    addClass,
    addStudent,
    addAttendence,
  },
};
