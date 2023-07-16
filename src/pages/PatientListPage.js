import React, { useEffect, useState } from "react";
import "../styles/PatientListPage.scss";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Client from 'fhir-kit-client';

export const PatientListPage = () => {
    console.log("geldim girdim gördüm")
    const [patientList, setPatientList] = useState([]);
    const [currentPageUrl, setCurrentPageUrl] = useState('');
    const [nextPageUrl, setNextPageUrl] = useState('');
    const [previousPageUrl, setPreviousPageUrl] = useState('');
    const [pageNumber, setPageNumber] = useState(1);

    const [renderer, setRenderer] = useState(0);

    const reRenderPage = () => {
        setRenderer(renderer + 1);
    };

    setCurrentPageUrl('https://hapi.fhir.org/baseR5/Patient')

    useEffect(() => {
        fetchPatientList(currentPageUrl);
    }, [renderer]);

    const fetchPatientList = async url => {
        try {
            const client = new Client({
                baseUrl: url
            });
            const response = client.search({
                resourceType: 'Patient',
                searchParams: {}
            });
            setPatientList([]);
            setPatientList(response.entry.map(entry => entry.resource));
            setCurrentPageUrl(response.link.find(link => link.relation === 'self')?.url || undefined)
            setNextPageUrl(response.link.find(link => link.relation === 'next')?.url || undefined)
            setPreviousPageUrl(response.link.find(link => link.relation === 'previous')?.url || undefined)
        } catch (error) {
            console.error('something went wrong!', error)
        }
    };

    const fetchNextPage = () => {
        if (!nextPageUrl) {
            console.error('there is no next page!');
            return -1;
        }
        setCurrentPageUrl(nextPageUrl ? nextPageUrl : currentPageUrl);
        setPageNumber(pageNumber + 1)
        reRenderPage();
        return 0
    }
    const fetchPreviousPage = () => {
        if (!previousPageUrl) {
            console.error('there is no previous page!');
            return -1;
        }
        setCurrentPageUrl(previousPageUrl ? previousPageUrl : currentPageUrl)
        setPageNumber(pageNumber - 1 >= 1 ? pageNumber - 1 : 1)
        reRenderPage();
        return 0
    }

    const columns = [
        { id: 'id', label: 'ID', minWidth: 100 },
        { id: 'name', label: 'Full Name', minWidth: 200 },
        { id: 'gender', label: 'Gender', minWidth: 100 },
        { id: 'birthdate', label: 'Birth Date', minWidth: 150 },
        { id: 'telecom', label: 'Telecom', minWidth: 150 },
        { id: 'address', label: 'Address' },
    ];

    const parseName = humanName => {
        const parseSingleName = singleName => {
            let names = '';

            if (Array.isArray(singleName.given)) {
                singleName.given.forEach((given) => {
                    names = names.concat(given, ' ');
                });
            } else {
                names = names.concat(singleName.given, ' ');
            }

            names = names.concat(singleName.family ? singleName.family : '');
            names = names.trim();

            return names;
        };
        if (Array.isArray(humanName)) {
            let chosenNameEntry = null;

            for (let i = 0; i < humanName.length; i++) {
                const nameEntry = humanName[i];
                const nameUse = nameEntry.use;

                if (nameUse === 'official') {
                    chosenNameEntry = nameEntry;
                    break;
                }

                if (!chosenNameEntry && ['usual', 'temp', 'nickname', 'anonymous', 'old', 'maiden'].includes(nameUse)) {
                    chosenNameEntry = nameEntry;
                }
            }

            if (chosenNameEntry) {
                return parseSingleName(chosenNameEntry)
            }
        }
    }

    return (
        <div>
            <h1>Patient List</h1>
            <Paper sx={{ width: '80%', overflow: 'hidden', borderRadius: '20px' }}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: '50%' }} aria-label="Patients">
                        <TableHead>
                            <TableRow>
                                {
                                    columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            className="table-cell">
                                            {column.label}
                                        </TableCell>
                                    ))
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                patientList.map((patient) => (
                                    <TableRow key={patient.id} className="table-row-cell">
                                        <TableCell>{patient.id || '-'}</TableCell>
                                        <TableCell>{parseName(patient.name)}</TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
}