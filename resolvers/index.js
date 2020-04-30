const { addAttendenceBulk } = require(`./mutation/addAttendenceBulk`),
	{ addAttendence } = require(`./mutation/addAttendence`),
	{ addTeacher } = require(`./mutation/addTeacher`),
	{ addStudent } = require(`./mutation/addStudent`),
	{ addSubject } = require(`./mutation/addSubject`),
	{ addClass } = require(`./mutation/addClass`);

const { updateAttendence } = require(`./mutation/updateAttendence`),
	{ updateStudent } = require(`./mutation/updateStudent`),
	{ updateTeacher } = require(`./mutation/updateTeacher`),
	{ updateSubject } = require(`./mutation/updateSubject`),
	{ updateClass } = require(`./mutation/updateClass`);

const { getAttendence } = require(`./query/getAttendence`),
	{ getTeacher } = require(`./query/getTeacher`),
	{ getStudent } = require(`./query/getStudent`),
	{ getClass } = require(`./query/getClass`);

module.exports = {
	Query: {
		getClass,
		getStudent,
		getTeacher,
		getAttendence,
	},
	Mutation: {
		addClass,
		addStudent,
		addSubject,
		addTeacher,
		addAttendenceBulk,

		updateClass,
		addAttendence,
		updateStudent,
		updateTeacher,
		updateSubject,
		updateAttendence,
	},
};
