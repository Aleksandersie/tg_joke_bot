import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const JokesPage: React.FC = () => {
  const { triggerId } = useParams<{ triggerId: string }>();
  const [jokes, setJokes] = useState([]);
  const [newJoke, setNewJoke] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJokeId, setSelectedJokeId] = useState<number | null>(null);

  useEffect(() => {
    fetchJokes();
  }, [triggerId]);

  const fetchJokes = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/triggers/${triggerId}/jokes`);
      setJokes(response.data);
    } catch (error) {
      console.error("Error fetching jokes:", error);
    }
  };

  const addJoke = async () => {
    if (!newJoke.trim()) return;
    try {
      await axios.post(`http://localhost:8080/api/triggers/${triggerId}/jokes`, { text: newJoke });
      setNewJoke('');
      fetchJokes();
    } catch (error) {
      console.error("Error adding joke:", error);
    }
  };

  const onDelete = (jokeId: number) => {
    setSelectedJokeId(jokeId);
    setIsOpen(true);
  };

  const handleDeleteJoke = async () => {
    if (selectedJokeId) {
      try {
        await axios.delete(`http://localhost:8080/api/jokes/${selectedJokeId}`);
        fetchJokes();
        setIsOpen(false);
      } catch (error) {
        console.error("Error deleting joke:", error);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-8">Ответы для триггера {triggerId}</h1>
      <div className="mb-5">
        <Input
          value={newJoke}
          onChange={(e) => setNewJoke(e.target.value)}
          placeholder="Введите новый ответ"
          className="mb-5"
        />
        <Button onClick={addJoke} color="primary">Добавить ответ</Button>
      </div>
      <Card className="bg-gray-800 shadow-xl">
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
            <TableColumn>ДЕЙСТВИЯ</TableColumn>
          </TableHeader>
          <TableBody>
            {jokes.length > 0 ? (
              jokes.map((joke: { id: number; text: string }) => (
                <TableRow key={joke.id} className="hover:bg-gray-700 transition-colors">
                  <TableCell className="font-semibold">{joke.text}</TableCell>
                  <TableCell>
                    <Button 
                      color="danger" 
                      onClick={() => onDelete(joke.id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center">Нет ответов для отображения</TableCell>
                <TableCell className="text-center">Нет ответов для отображения</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
                <p>Вы действительно хотите удалить этот ответ?</p>
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

export default JokesPage; 