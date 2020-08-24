module.exports = {
	Query: {
		departments: require(`./query/departments`),
		courses: require(`./query/courses`),

		attendenceMonth: require(`./query/getFullMonthAttendence`),
		attendence: require(`./query/getAttendence`),
		timeTable: require(`./query/timeTable`),
		teachers: require(`./query/getTeacher`),
		students: require(`./query/getStudent`),
		subjects: require(`./query/subjects`),
		classes: require(`./query/classes`),
		class: require(`./query/getClass`),
		notes: require(`./query/notes`),
	},
	Mutation: {
		addDepartment: require(`./mutation/addDepartment`),
		updateDepartment: require(`./mutation/updateDepartment`),

		addCourse: require(`./mutation/addCourse`),
		updateCourse: require(`./mutation/updateCourse`),

		addAttendenceMany: require(`./mutation/addAttendenceMany`),
		updateAttendence: require(`./mutation/updateAttendence`),
		createTimeTable: require(`./mutation/createTimeTable`),
		changePassword: require(`./mutation/changePassword`),
		addAttendence: require(`./mutation/addAttendence`),
		updateStudent: require(`./mutation/updateStudent`),
		updateTeacher: require(`./mutation/updateTeacher`),
		updateSubject: require(`./mutation/updateSubject`),
		updateClass: require(`./mutation/updateClass`),
		newSession: require(`./mutation/newSession`),
		addTeacher: require(`./mutation/addTeacher`),
		addStudent: require(`./mutation/addStudent`),
		addSubject: require(`./mutation/addSubject`),
		createNote: require(`./mutation/addNote`),
		login: require(`./mutation/login`),
	},
};
