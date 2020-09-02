const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { class: className, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`attendence`);

		if (data.holiday && data.students)
			throw new UserInputError(`It's holiday ⚠`, {
				error: `Cannot add students on holiday.`,
			});

		const check = await node.findOne({ day: data.day, class: data.class });
		if (check)
			throw new UserInputError(`Already saved ⚠`, {
				error: `Attendence already taken at ${new Date(check.createdAt)
					.toLocaleTimeString(`en-in`, {
						weekday: `short`,
						year: `numeric`,
						month: `long`,
						day: `numeric`,
					})
					.replace(/,/g, ``)}. You can edit it though.`,
			});

		const [year, month, date] = data.day.split(`-`);

		const { insertedId } = await node.insertOne({
			class: className,
			...data,
			idx: { date: Number(date), month: Number(month) - 1, year: Number(year) },
			totalStudents: data.students ? data.students.length : 0,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [attendence] = await node
			.aggregate([
				{ $match: { _id: insertedId } },
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
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		return attendence;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
