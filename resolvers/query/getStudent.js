const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`, `Student`];

module.exports = async (_, { sid, cid }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`students`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		// if (!sid && !cid)
		// 	throw new UserInputError(`Insufficient data ⚠`, {
		// 		error: `Provide either a student or class info to get details of student(s).`,
		// 	});
		if (sid !== undefined) {
			const studentId = node.findOne({ username: sid });
			if (user.access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);
			return await node
				.aggregate([
					{
						$match: {
							username: sid,
						},
					},
					{
						$lookup: {
							from: `attendence`,
							localField: `username`,
							foreignField: `students`,
							as: `attendence`,
						},
					},
					{
						$addFields: { class: { $toObjectId: `$class` } },
					},
					{
						$lookup: {
							from: `classes`,
							localField: `class`,
							foreignField: `_id`,
							as: `class`,
						},
					},
					{
						$unwind: `$class`,
					},
				])
				.toArray();
		} else {
			if (cid === undefined) {
				const classTeacherOf = await client.db(`RBMI`).collection(`classes`).findOne({ classTeacher: user._id });
				cid = classTeacherOf._id.toString();
			}
			return await node
				.aggregate([
					{
						$match: {
							class: cid,
						},
					},
					{
						$lookup: {
							from: `attendence`,
							localField: `username`,
							foreignField: `students`,
							as: `attendence`,
						},
					},
					{
						$addFields: { class: { $toObjectId: `$class` } },
					},
					{
						$lookup: {
							from: `classes`,
							localField: `class`,
							foreignField: `_id`,
							as: `class`,
						},
					},
					{
						$unwind: `$class`,
					},
				])
				.toArray();
		}
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
