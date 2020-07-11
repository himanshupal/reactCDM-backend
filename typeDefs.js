const { gql } = require(`apollo-server`);

module.exports = gql`
	input NameInputObject {
		first: String
		last: String
	}
	input ParentInputObject {
		name: String
		occupation: String
		annualSalary: String
		contactNumber: String
	}
	input AddressInputObject {
		current: AddressInputDefinition
		permanent: AddressInputDefinition
	}
	input AddressInputDefinition {
		locality: String
		district: String
		city: String
	}
	input StudentInput {
		username: String
		rollNumber: String
		registrationNumber: String
		enrollmentNumber: String
		name: NameInputObject
		father: ParentInputObject
		mother: ParentInputObject
		bloodGroup: String
		gender: String
		caste: String
		class: String
		religion: String
		dateOfBirth: String
		address: AddressInputObject
		aadharNumber: String
		photo: String
		email: String
		contactNumber: String
		dateOfLeaving: String
	}
	type Name {
		first: String
		last: String
	}
	type Parent {
		name: String
		occupation: String
		annualSalary: Int
		contactNumber: String
	}
	type Address {
		current: AddressDefinition
		permanent: AddressDefinition
	}
	type AddressDefinition {
		locality: String
		district: String
		city: String
		pincode: Int
		state: String
	}
	type Student {
		_id: ID
		username: String
		rollNumber: String
		registrationNumber: String
		enrollmentNumber: String
		name: Name
		father: Parent
		mother: Parent
		bloodGroup: String
		gender: String
		caste: String
		class: Class
		religion: String
		dateOfBirth: String
		address: Address
		photo: String
		email: String
		attendence: [AttendenceClass]
		aadharNumber: String
		contactNumber: String
		dateOfLeaving: String
		createdAt: Float
		lastUpdated: Float
	}
	input AttendenceInputBulk {
		class: String
		data: [AttendenceInput]
	}
	# input DayInput {
	# 	date: Int
	# 	month: Int
	# 	year: Int
	# }
	input AttendenceInput {
		day: String
		class: String
		holiday: String
		students: [String]
	}
	input AttendenceUpdateInput {
		holiday: String
		students: [String]
	}
	type Day {
		date: Int
		month: Int
		year: Int
	}
	type AttendenceClass {
		_id: ID
		day: Day
		holiday: String
		totalStudents: Int
		students: [String]
		createdAt: Float
		createdBy: String
		lastUpdated: Float
	}
	type AttendenceDay {
		_id: ID
		day: Day
		holiday: String
		totalStudents: Int
		students: [Student]
		createdAt: Float
		createdBy: String
		lastUpdated: Float
	}
	input ClassInput {
		sessionStart: String
		sessionEnd: String
		course: String
		batch: String
		department: String
		classTeacher: String
	}
	type Class {
		_id: ID
		sessionStart: Day
		sessionEnd: Day
		class: String
		year: Int
		semester: Int
		batch: Int
		alias: String
		totalStudents: Int
		department: String
		timeTable: [Subject]
		classTeacher: String
		attendence: [AttendenceClass]
		students: [Student]
		createdAt: Float
		createdBy: String
		lastUpdated: Float
	}
	input SubjectInput {
		name: String
		subjectCode: String
		uniSubjectCode: String
		classRef: String
		teacher: String
		from: String
		to: String
	}
	type Subject {
		_id: ID
		name: String
		uniSubjectCode: String
		classRef: String
		teacher: String
		from: String
		to: String
		createdAt: Float
		createdBy: String
		lastUpdated: Float
	}
	input TeacherInput {
		username: String
		designation: String
		registrationNumber: String
		name: NameInputObject
		father: ParentInputObject
		mother: ParentInputObject
		bloodGroup: String
		gender: String
		caste: String
		religion: String
		dateOfBirth: String
		address: AddressInputObject
		aadharNumber: String
		photo: String
		email: String
		major: String
		contactNumber: String
		dateOfJoining: String
		dateOfLeaving: String
	}
	type Teacher {
		_id: ID
		username: String
		designation: String
		registrationNumber: String
		name: Name
		father: Parent
		mother: Parent
		bloodGroup: String
		gender: String
		caste: String
		religion: String
		dateOfBirth: String
		address: Address
		aadharNumber: String
		photo: String
		email: String
		major: String
		teaches: [Subject]
		contactNumber: String
		dateOfJoining: String
		dateOfLeaving: String
		classTeacherOf: Class
		createdAt: Float
		createdBy: String
		lastUpdated: Float
	}
	input GistInput {
		subject: String
		description: String
		scope: String
	}
	type Gist {
		_id: ID
		subject: String
		description: String
		scope: String
		createdAt: Float
		createdBy: String
	}
	input LoginInput {
		username: String
		password: String
		otk: String
	}
	input CourseInput {
		name: String
		duration: String
		semesterBased: Boolean
		director: String
		department: String
		headOfDepartment: String
	}
	type Course {
		name: String
		duration: String
		semesterBased: Boolean
		department: String
		director: String
		headOfDepartment: String
		createdBy: String
		createdAt: Float
	}
	type Department {
		name: String
		director: String
		createdAt: Float
		createdBy: String
	}
	type Query {
		getFullMonthAttendence(
			month: Int
			year: Int
			class: String
		): [AttendenceDay]
		getCourses(department: String): [Course]
		getDepartments: [Department]
		getGist(id: ID): [Gist]
		getStudent(id: ID): Student
		getTeacher(id: ID): [Teacher]
		getAttendence(id: ID!): AttendenceDay
		getClass(id: ID, department: String): [Class]
	}
	type Mutation {
		login(data: LoginInput): String
		addClass(data: ClassInput): String
		createGist(data: GistInput): String
		addCourse(data: CourseInput): String
		addStudent(data: StudentInput): String
		addSubject(data: SubjectInput): String
		addTeacher(data: TeacherInput): String
		addAttendence(data: AttendenceInput): String
		updateClass(id: ID!, data: ClassInput): String
		updateStudent(id: ID!, data: StudentInput): String
		updateTeacher(id: ID!, data: TeacherInput): String
		updateSubject(id: ID!, data: SubjectInput): String
		addAttendenceMany(data: AttendenceInputBulk): String
		updateAttendence(id: ID!, data: AttendenceUpdateInput!): String
	}
`;
