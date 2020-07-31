const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`, `Student`];

module.exports = async (_, { month, year, cid }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`attendence`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (user.access === `student`)
			return await node
				.aggregate([
					{
						$match: {
							"idx.month": month ? month : new Date().getMonth(),
							"idx.year": year ? year : new Date().getFullYear(),
						},
						$in: [user._id, `$students`],
					},
				])
				.toArray();
		const classTeacherOf = await client.db(`RBMI`).collection(`classes`).findOne({ classTeacher: user._id });
		if (!classTeacherOf)
			if (!cid) throw new UserInputError(`Insufficient data ⚠`, { error: `You must provide Class info. to get details of.` });
			else throw new UserInputError(`No class Assigned ⚠`, { error: `You are not currently assigned as Class Teacher for any Class.` });
		return await node
			.aggregate([
				{
					$match: {
						class: classTeacherOf ? classTeacherOf._id.toString() : cid,
						"idx.month": month ? month : new Date().getMonth(),
						"idx.year": year ? year : new Date().getFullYear(),
					},
				},
				// {
				// 	$addFields: {
				// 		students: {
				// 			$map: {
				// 				input: `$students`,
				// 				as: `student`,
				// 				in: { $toObjectId: `$$student` },
				// 			},
				// 		},
				// 	},
				// },
				// {
				// 	$lookup: {
				// 		from: `students`,
				// 		localField: `students`,
				// 		foreignField: `_id`,
				// 		as: `students`,
				// 	},
				// },
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
