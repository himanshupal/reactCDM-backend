const query = `./resolvers/query/`;
const mutation = `./resolvers/mutation/`;

module.exports = {
	Query: {
		attendenceMonth: require(`${query}getFullMonthAttendence`),
		departments: require(`${query}getDepartments`),
		attendence: require(`${query}getAttendence`),
		teachers: require(`${query}getTeacher`),
		students: require(`${query}getStudent`),
		// courses: require(`${query}getCourse`),
		classes: require(`${query}classes`),
		class: require(`${query}getClass`),
		gists: require(`${query}getGist`),
	},
	Mutation: {
		addAttendenceMany: require(`${mutation}addAttendenceMany`),
		updateAttendence: require(`${mutation}updateAttendence`),
		updateDepartment: require(`${mutation}updateDepartment`),
		addAttendence: require(`${mutation}addAttendence`),
		updateStudent: require(`${mutation}updateStudent`),
		updateTeacher: require(`${mutation}updateTeacher`),
		updateSubject: require(`${mutation}updateSubject`),
		updateCourse: require(`${mutation}updateCourse`),
		updateClass: require(`${mutation}updateClass`),
		newSession: require(`${mutation}newSession`),
		addTeacher: require(`${mutation}addTeacher`),
		addStudent: require(`${mutation}addStudent`),
		addSubject: require(`${mutation}addSubject`),
		createGist: require(`${mutation}createGist`),
		addCourse: require(`${mutation}addCourse`),
		login: require(`${mutation}login`),
	},
};