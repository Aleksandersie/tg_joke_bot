import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import axios from 'axios';

interface JokeX {
  id: number;
  text: string;
}

const JokesX: React.FC = () => {
  const [jokes, setJokes] = useState<JokeX[]>([]);
  const [newJoke, setNewJoke] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJokeId, setSelectedJokeId] = useState<number | null>(null);

  useEffect(() => {
    fetchJokes();
  }, []);

  const fetchJokes = async () => {
    try {
      const response = await axios.get<JokeX[]>('http://localhost:8080/api/jokes-x');
      setJokes(response.data);
    } catch (error) {
      console.error("Error fetching jokes:", error);
    }
  };

  const handleAddJoke = async () => {
    if (!newJoke.trim()) return;
    try {
      await axios.post('http://localhost:8080/api/jokes-x', { text: newJoke });
      setNewJoke('');
      fetchJokes();
    } catch (error) {
      console.error("Error adding joke:", error);
    }
  };

  const onDelete = (id: number) => {
    setSelectedJokeId(id);
    setIsOpen(true);
  };

  const handleDeleteJoke = async () => {
    if (selectedJokeId) {
      try {
        await axios.delete(`http://localhost:8080/api/jokes-x/${selectedJokeId}`);
        fetchJokes();
        setIsOpen(false);
      } catch (error) {
        console.error("Error deleting joke:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 bg-gray-800 shadow-xl">
        <CardHeader className="flex gap-3 bg-gray-700 rounded-t-xl">
          <div className="flex flex-col">
            <p className="text-xl text-white font-semibold">Новый анекдот</p>
            <p className="text-small text-gray-400">Добавьте новый анекдот</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4">
            <Input
              value={newJoke}
              onChange={(e) => setNewJoke(e.target.value)}
              placeholder="Введите анекдот"
              className="flex-grow"
              size="lg"
            />
            <Button 
              color="primary" 
              onClick={handleAddJoke}
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
            aria-label="Jokes table"
            classNames={{
              wrapper: "bg-gray-800",
              th: "bg-gray-700 text-white",
              td: "text-white"
            }}
          >
            <TableHeader>
              <TableColumn>ТЕКСТ</TableColumn>
              <TableColumn align="center">ДЕЙСТВИЯ</TableColumn>
            </TableHeader>
            <TableBody>
              {jokes.map((joke) => (
                <TableRow key={joke.id} className="hover:bg-gray-700 transition-colors">
                  <TableCell className="font-semibold">{joke.text}</TableCell>
                  <TableCell>
                    <Button 
                      color="danger"
                      className="text-white bg-danger-500 hover:bg-danger-600"
                      onClick={() => onDelete(joke.id)}
                    >
                      Удалить анекдот
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={(open) => setIsOpen(open)}
        classNames={{
          base: "bg-gray-800",
          header: "text-white border-b border-gray-700",
          body: "text-white py-6",
          footer: "border-t border-gray-700",
          closeButton: "text-white hover:bg-gray-700 active:bg-gray-600"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Подтверждение удаления</ModalHeader>
              <ModalBody>
                <p>Вы действительно хотите удалить этот анекдот?</p>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="default" 
                  variant="light" 
                  onPress={onClose}
                  className="text-white"
                >
                  Отмена
                </Button>
                <Button 
                  color="danger" 
                  onPress={handleDeleteJoke}
                >
                  Удалить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default JokesX; 