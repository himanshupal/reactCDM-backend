const { addAttendenceMany } = require(`./mutation/addAttendenceMany`),
	{ addAttendence } = require(`./mutation/addAttendence`),
	{ addTeacher } = require(`./mutation/addTeacher`),
	{ addStudent } = require(`./mutation/addStudent`),
	{ addSubject } = require(`./mutation/addSubject`),
	{ createGist } = require(`./mutation/createGist`),
	{ addClass } = require(`./mutation/addClass`),
	{ login } = require(`./mutation/login`);

const { updateAttendence } = require(`./mutation/updateAttendence`),
	{ updateStudent } = require(`./mutation/updateStudent`),
	{ updateTeacher } = require(`./mutation/updateTeacher`),
	{ updateSubject } = require(`./mutation/updateSubject`),
	{ updateClass } = require(`./mutation/updateClass`);

const { getFullMonthAttendence } = require(`./query/getFullMonthAttendence`),
	{ getAttendence } = require(`./query/getAttendence`),
	{ getTeacher } = require(`./query/getTeacher`),
	{ getStudent } = require(`./query/getStudent`),
	{ getClass } = require(`./query/getClass`),
	{ getGist } = require(`./query/getGist`);

module.exports = {
	Query: {
		getGist,
		getClass,
		getStudent,
		getTeacher,
		getAttendence,
		getFullMonthAttendence,
	},
	Mutation: {
		login,

		addClass,
		addStudent,
		addSubject,
		addTeacher,
		createGist,
		addAttendenceMany,

		updateClass,
		addAttendence,
		updateStudent,
		updateTeacher,
		updateSubject,
		updateAttendence,
	},
};
