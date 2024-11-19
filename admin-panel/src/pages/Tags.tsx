import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTriggerId, setSelectedTriggerId] = useState<number | null>(null);

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

  const onDelete = (id: number) => {
    setSelectedTriggerId(id);
    setIsOpen(true);
  };

  const handleDeleteTrigger = async () => {
    if (selectedTriggerId) {
      try {
        await axios.delete(`http://localhost:8080/api/triggers/${selectedTriggerId}`);
        fetchTriggers();
        setIsOpen(false);
      } catch (error) {
        console.error("Error deleting trigger:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6 bg-gray-800 shadow-xl">
        <CardHeader className="flex gap-3 bg-gray-700 rounded-t-xl">
          <div className="flex flex-col">
            <p className="text-xl text-white font-semibold">Новый триггер</p>
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
                    <Link to={`/jokes/${trigger.id}`} className="w-full h-full block p-2">
                      {trigger.value}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Button 
                      color="danger"
                      className="text-white bg-danger-500 hover:bg-danger-600"
                      onClick={() => onDelete(trigger.id)}
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
                <p>Вы действительно хотите удалить этот триггер?</p>
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
                  onPress={handleDeleteTrigger}
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

export default Tags;