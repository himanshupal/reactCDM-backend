const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { class: className, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInuser, access } = await authenticate(authorization);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`attendence`);

		return await Promise.all(
			data.map(async (current) => {
				try {
					if (current.day !== undefined) {
						const [year, month, date] = current.day.split(`-`);

						const { lastErrorObject, value } = await node.findOneAndUpdate(
							{ day: current.day },
							{
								$set: {
									class: className,
									holiday: current.holiday,
									students: current.students,
									idx: { date: Number(date), month: Number(month) - 1, year: Number(year) },
									totalStudents: current.students ? current.students.length : 0,
									createdAt: Timestamp.fromNumber(Date.now()),
									createdBy: loggedInuser,
								},
							},
							{ upsert: true, returnOriginal: false }
						);

						if (!lastErrorObject.n)
							throw new UserInputError(`Unknown Error ⚠`, {
								error: `Error creating/updating class. Please try again or contact admin if issue persists.`,
							});

						const [singleDay] = await node
							.aggregate([
								{ $match: { _id: value._id } },
								{
									$addFields: {
										students: { $toObjectId: `$students` },
										createdBy: { $toObjectId: `$createdBy` },
									},
								},
								{
									$lookup: {
										from: `students`,
										localField: `students`,
										foreignField: `_id`,
										as: `students`,
									},
								},
								{
									$lookup: {
										from: `teachers`,
										localField: `createdBy`,
										foreignField: `_id`,
										as: `createdBy`,
									},
								},
								{ $unwind: `$createdBy` },
							])
							.toArray();

						return singleDay;
					}
				} catch (error) {
					throw error;
				}
			})
		);
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
