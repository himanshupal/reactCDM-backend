const { addStudent } = require(`../resolvers/mutation/addStudent`);
const { students } = require(`../resolvers/query/students`);
const { student } = require(`../resolvers/query/student`);

module.exports = {
  Query: {
    student,
    students,
  },
  Mutation: {
    addStudent,
  },
};
