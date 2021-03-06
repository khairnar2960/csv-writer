const assertFile = require('../helper').assertFile;
const testFilePath = require('../helper').testFilePath;
const fs = require('fs');
const createObjectCsvWriter = require('../../index').createObjectCsvWriter;

describe('Write object records into CSV', () => {

    const makeFilePath = id => testFilePath(`object-${id}`);
    const records = [
        {name: 'Bob', lang: 'French'},
        {name: 'Mary', lang: 'English'}
    ];

    describe('When only path and header ids are given', () => {
        'use strict';

        const filePath = makeFilePath('minimum');
        let writer;

        beforeEach(() => {
            writer = createObjectCsvWriter({
                path: filePath,
                header: ['name', 'lang']
            });
        });

        it('writes records to a new file', () => {
            return writer.writeRecords(records).then(() => {
                assertFile(filePath, 'Bob,French\nMary,English\n');
            });
        });

        it('appends records when requested to write to the same file', () => {
            return Promise.resolve()
                .then(() => writer.writeRecords([records[0]]))
                .then(() => writer.writeRecords([records[1]]))
                .then(() => {
                    assertFile(filePath, 'Bob,French\nMary,English\n');
                });
        });
    });

    describe('When header ids are given with reverse order', () => {
        const filePath = makeFilePath('column-order');
        const writer = createObjectCsvWriter({
            path: filePath,
            header: ['lang', 'name']
        });

        it('also writes columns with reverse order', () => {
            return writer.writeRecords(records).then(() => {
                assertFile(filePath, 'French,Bob\nEnglish,Mary\n');
            });
        });
    });

    describe('When field header is given with titles', () => {
        const filePath = makeFilePath('header');
        const writer = createObjectCsvWriter({
            path: filePath,
            header: [{id: 'name', title: 'NAME'}, {id: 'lang', title: 'LANGUAGE'}]
        });

        it('writes a header', () => {
            return writer.writeRecords(records).then(() => {
                assertFile(filePath, 'NAME,LANGUAGE\nBob,French\nMary,English\n');
            });
        });
    });

    describe('When `append` flag is specified', () => {
        const filePath = makeFilePath('append');
        fs.writeFileSync(filePath, 'Mike,German\n', 'utf8');
        const writer = createObjectCsvWriter({
            path: filePath,
            header: ['name', 'lang'],
            append: true
        });

        it('do not overwrite the existing contents and appends records to them', () => {
            return writer.writeRecords([records[1]]).then(() => {
                assertFile(filePath, 'Mike,German\nMary,English\n');
            });
        });
    });

    describe('When encoding is specified', () => {
        const filePath = makeFilePath('encoding');
        const writer = createObjectCsvWriter({
            path: filePath,
            header: ['name', 'lang'],
            encoding: 'utf16le'
        });

        it('writes to a file with the specified encoding', () => {
            return writer.writeRecords(records).then(() => {
                assertFile(filePath, 'Bob,French\nMary,English\n', 'utf16le');
            });
        });
    });

    describe('When semicolon is specified as a field delimiter', () => {
        const filePath = makeFilePath('field-delimiter');
        const writer = createObjectCsvWriter({
            path: filePath,
            header: [{id: 'name', title: 'NAME'}, {id: 'lang', title: 'LANGUAGE'}],
            fieldDelimiter: ';'
        });

        it('writes to a file with the specified encoding', () => {
            return writer.writeRecords(records).then(() => {
                assertFile(filePath, 'NAME;LANGUAGE\nBob;French\nMary;English\n');
            });
        });
    });
});
