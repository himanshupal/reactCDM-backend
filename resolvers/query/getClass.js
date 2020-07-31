const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`, `Student`],
	privAccessAllowed = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { cid }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`classes`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (user.access === `student`) {
			const student = await client.db(`RBMI`).collection(`students`).findOne({ username: user.username });
			const res = await node
				.aggregate([
					{
						$match: {
							_id: ObjectId(student.class),
						},
					},
					{
						$lookup: {
							from: `subjects`,
							localField: `name`,
							foreignField: `class`,
							as: `timeTable`,
						},
					},
				])
				.toArray();
			return res[0];
		}
		let classTeacherOf = await node.findOne({ classTeacher: user.username });
		if (cid && privAccessAllowed.includes(user.access)) {
			const res = await node
				.aggregate([
					{
						$match: {
							_id: ObjectId(cid),
						},
					},
					{
						$addFields: { _id: { $toString: `$_id` } },
					},
					{
						$lookup: {
							from: `students`,
							localField: `_id`,
							foreignField: `class`,
							as: `students`,
						},
					},
					// {
					// 	$lookup: {
					// 		from: `attendence`,
					// 		localField: `_id`,
					// 		foreignField: `class`,
					// 		as: `attendence`,
					// 	},
					// },
					{
						$lookup: {
							from: `subjects`,
							localField: `name`,
							foreignField: `class`,
							as: `timeTable`,
						},
					},
				])
				.toArray();
			const ret = res.map((el) => {
				return { ...el, totalStudents: el.students.length };
			});
			return ret[0];
		}
		if (!classTeacherOf || !privAccessAllowed.includes(user.access)) {
			if (privAccessAllowed.includes(user.access) && !cid)
				throw new UserInputError(`Insufficient data ⚠`, { error: `You must provide Class info. to get details of.` });
			throw new UserInputError(`No class Assigned ⚠`, { error: `You are not currently assigned as Class Teacher for any Class.` });
		}
		const res = await node
			.aggregate([
				{
					$match: {
						_id: classTeacherOf._id,
					},
				},
				{
					$addFields: { _id: { $toString: `$_id` } },
				},
				{
					$lookup: {
						from: `students`,
						localField: `_id`,
						foreignField: `class`,
						as: `students`,
					},
				},
				// {
				// 	$lookup: {
				// 		from: `attendence`,
				// 		localField: `_id`,
				// 		foreignField: `class`,
				// 		as: `attendence`,
				// 	},
				// },
				{
					$lookup: {
						from: `subjects`,
						localField: `name`,
						foreignField: `class`,
						as: `timeTable`,
					},
				},
			])
			.toArray();
		const ret = res.map((el) => {
			return { ...el, totalStudents: el.students.length };
		});
		return ret[0];
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
