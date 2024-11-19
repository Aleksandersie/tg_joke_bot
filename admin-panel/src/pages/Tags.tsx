import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Joke {
  id: number;
  text: string;
}

interface Trigger {
  id: number;
  value: string;
  jokes: Joke[];
}

const Tags: React.FC = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [newTrigger, setNewTrigger] = useState<string>('');
  const [newJoke, setNewJoke] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      const response = await axios.get<Trigger[]>('http://localhost:8080/api/triggers');
      setTriggers(response.data);
    } catch (error) {
      console.error("Error fetching triggers:", error);
    }
  };

  const handleAddTrigger = async () => {
    if (!newTrigger.trim()) return;
    try {
      await axios.post('http://localhost:8080/api/triggers', { value: newTrigger });
      setNewTrigger('');
      fetchTriggers();
    } catch (error) {
      console.error("Error adding trigger:", error);
    }
  };

  const handleDeleteTrigger = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/api/triggers/${id}`);
      fetchTriggers();
    } catch (error) {
      console.error("Error deleting trigger:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 bg-gray-800 shadow-xl">
        <CardHeader className="flex gap-3 bg-gray-700 rounded-t-xl">
          <div className="flex flex-col">
            <p className="text-xl font-semibold">Новый триггер</p>
            <p className="text-small text-gray-400">Добавьте новое слово-триггер для бота</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4">
            <Input
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              placeholder="Введите триггер"
              className="flex-grow"
              size="lg"
            />
            <Button 
              color="primary" 
              onClick={handleAddTrigger}
              size="lg"
              className="px-8"
            >
              Добавить
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gray-800 shadow-xl">
        <CardBody>
          <Table 
            aria-label="Triggers table"
            classNames={{
              wrapper: "bg-gray-800",
              th: "bg-gray-700 text-white",
              td: "text-white"
            }}
          >
            <TableHeader>
              <TableColumn>ТРИГГЕР</TableColumn>
              <TableColumn align="center">ДЕЙСТВИЯ</TableColumn>
            </TableHeader>
            <TableBody>
              {triggers.map((trigger) => (
                <TableRow key={trigger.id} className="hover:bg-gray-700 transition-colors">
                  <TableCell className="font-semibold">
                    <Link to={`/jokes/${trigger.id}`}>{trigger.value}</Link>
                  </TableCell>
                  <TableCell>
                    <Button 
                      color="danger"
                      variant="flat"
                      onClick={() => handleDeleteTrigger(trigger.id)}
                    >
                      Удалить триггер
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default Tags;