const { ForbiddenError, UserInputError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { _id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`timetable`);

		const { lastErrorObject, value } = await node.findOneAndUpdate(
			{ _id: ObjectId(_id) },
			{
				$set: {
					range: data.filter((x) => x.from && x.to),
					createdAt: Timestamp.fromNumber(Date.now()),
					createdBy: loggedInUser,
				},
			},
			{ returnOriginal: false }
		);

		if (!lastErrorObject.n)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error creating/updating class. Please try again or contact admin if issue persists.`,
			});

		const [timeTable] = await node
			.aggregate([
				{ $match: { _id: value._id } },
				{
					$lookup: {
						from: `teachers`,
						let: { teacher: { $toObjectId: `days.teacher` } },
						pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$teacher`] } } }],
						as: `teacher`,
					},
				},
				{
					$lookup: {
						from: `subject`,
						let: { subject: { $toObjectId: `days.subject` } },
						pipeline: [{ $match: { $expr: { $eq: [`$_id`, `$$subject`] } } }],
						as: `subject`,
					},
				},
			])
			.toArray();

		return timeTable;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
