module.exports = {
	Query: {
		departments: require(`./query/departments`),

		courses: require(`./query/courses`),

		teachers: require(`./query/teachers`),
		teacher: require(`./query/teacher`),

		students: require(`./query/students`),
		student: require(`./query/student`),

		classes: require(`./query/classes`),

		attendenceMonth: require(`./query/getFullMonthAttendence`),
		attendence: require(`./query/getAttendence`),
		timeTable: require(`./query/timeTable`),
		notes: require(`./query/notes`),
	},
	Mutation: {
		addDepartment: require(`./mutation/addDepartment`),
		updateDepartment: require(`./mutation/updateDepartment`),

		addCourse: require(`./mutation/addCourse`),
		updateCourse: require(`./mutation/updateCourse`),

		addTeacher: require(`./mutation/addTeacher`),
		updateTeacher: require(`./mutation/updateTeacher`),

		addStudent: require(`./mutation/addStudent`),
		updateStudent: require(`./mutation/updateStudent`),

		newSession: require(`./mutation/newSession`),
		updateClass: require(`./mutation/updateClass`),

		updateSubject: require(`./mutation/updateSubject`),
		addSubject: require(`./mutation/addSubject`),

		addTimeTable: require(`./mutation/addTimeTable`),

		addAttendenceMany: require(`./mutation/addAttendenceMany`),
		updateAttendence: require(`./mutation/updateAttendence`),
		addAttendence: require(`./mutation/addAttendence`),
		createNote: require(`./mutation/addNote`),

		changePassword: require(`./mutation/changePassword`),
		login: require(`./mutation/login`),
	},
};
