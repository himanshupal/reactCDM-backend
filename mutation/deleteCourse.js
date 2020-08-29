const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { _id, classes }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const deleteCourse = async () => {
			const { deletedCount } = await client
				.db(`RBMI`)
				.collection(`courses`)
				.deleteOne({ _id: ObjectId(_id) });

			if (!deletedCount)
				throw new UserInputError(`Unknown Error ⚠`, {
					error: `Error deleting course. Please try again or contact admin if issue persists.`,
				});
		};

		const deleteClasses = async () => {
			const node = client.db(`RBMI`).collection(`classes`);

			const classIt = await node.find({ course: _id }, { projection: { _id: true, name: true } }).toArray();

			const { deletedCount } = await node.deleteMany({ course: _id });

			if (!deletedCount)
				throw new UserInputError(`Unknown Error ⚠`, {
					error: `Error deleting class. Please try again or contact admin if issue persists.`,
				});

			await Promise.all(
				classIt.forEach(async ({ _id, name }) => {
					try {
						const { deletedCount: deletedStudents } = await client
							.db(`RBMI`)
							.collection(`students`)
							.deleteMany({ class: _id.toString() });

						if (!deletedStudents)
							throw new UserInputError(`Unknown Error ⚠`, {
								error: `Error deleting students. Please try again or contact admin if issue persists.`,
							});

						const { deletedCount: deletedNotes } = await client
							.db(`RBMI`)
							.collection(`notes`)
							.deleteMany({ scope: `Class`, class: _id.toString() });

						if (!deletedNotes)
							throw new UserInputError(`Unknown Error ⚠`, {
								error: `Error deleting notes. Please try again or contact admin if issue persists.`,
							});

						const { deletedCount: deletedNotices } = await client
							.db(`RBMI`)
							.collection(`notices`)
							.deleteMany({ scope: `Class`, validFor: name });

						if (!deletedNotices)
							throw new UserInputError(`Unknown Error ⚠`, {
								error: `Error deleting notices. Please try again or contact admin if issue persists.`,
							});

						const { deletedCount: deletedSubjects } = await client
							.db(`RBMI`)
							.collection(`subjects`)
							.deleteMany({ class: name });

						if (!deletedSubjects)
							throw new UserInputError(`Unknown Error ⚠`, {
								error: `Error deleting subjects. Please try again or contact admin if issue persists.`,
							});

						const { deletedCount: deletedTimeTable } = await client
							.db(`RBMI`)
							.collection(`timetables`)
							.deleteMany({ class: name });

						if (!deletedTimeTable)
							throw new UserInputError(`Unknown Error ⚠`, {
								error: `Error deleting timetable. Please try again or contact admin if issue persists.`,
							});
					} catch (error) {
						throw error;
					}
				})
			);
		};

		if (classes) {
			await deleteCourse();
			await deleteClasses();
		} else {
			await deleteCourse;
		}

		return true;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
