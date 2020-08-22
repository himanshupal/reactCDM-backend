const query = `./resolvers/query/`;
const mutation = `./resolvers/mutation/`;

module.exports = {
	Query: {
		attendenceMonth: require(query + `getFullMonthAttendence`),
		departments: require(query + `getDepartments`),
		attendence: require(query + `getAttendence`),
		timeTable: require(query + `timeTable`),
		teachers: require(query + `getTeacher`),
		students: require(query + `getStudent`),
		subjects: require(query + `subjects`),
		classes: require(query + `classes`),
		class: require(query + `getClass`),
		notes: require(query + `notes`),
	},
	Mutation: {
		addAttendenceMany: require(mutation + `addAttendenceMany`),
		updateAttendence: require(mutation + `updateAttendence`),
		updateDepartment: require(mutation + `updateDepartment`),
		createTimeTable: require(mutation + `createTimeTable`),
		changePassword: require(mutation + `changePassword`),
		addAttendence: require(mutation + `addAttendence`),
		updateStudent: require(mutation + `updateStudent`),
		updateTeacher: require(mutation + `updateTeacher`),
		updateSubject: require(mutation + `updateSubject`),
		updateCourse: require(mutation + `updateCourse`),
		updateClass: require(mutation + `updateClass`),
		newSession: require(mutation + `newSession`),
		addTeacher: require(mutation + `addTeacher`),
		addStudent: require(mutation + `addStudent`),
		addSubject: require(mutation + `addSubject`),
		addCourse: require(mutation + `addCourse`),
		createNote: require(mutation + `addNote`),
		login: require(mutation + `login`),
	},
};
