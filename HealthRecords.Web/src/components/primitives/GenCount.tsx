import { queryClient } from "@/main";
import { AdminAPI } from "@api/admin";
import { Group, NumberInput, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { FC, useState } from "react";

interface GenCountProps {
    tableName: string;
    genFor: {
        mutationKey: string[];
        mutationFn: (input: { count: number }) => Promise<any>;
        invalidates: string[];
    };
}

const GenCount: FC<GenCountProps> = (props) => {
    const [count, setCount] = useState(1);

    const generate = useMutation({
        mutationKey: props.genFor.mutationKey,
        mutationFn: async (count: number) => await props.genFor.mutationFn({ count: count }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin', 'counts'] });
            await queryClient.invalidateQueries({ queryKey: props.genFor.invalidates });
            notifications.show({ title: `${props.tableName} Generate Success!`, message: `${count} rows generated`, color: 'green' });
        },
        onError: (e) => notifications.show({ title: 'Error', message: e.message, color: 'red' }),
    });

    return (
        <Group>
            <NumberInput
                value={count}
                onChange={(value) => {
                    typeof value === 'string' && (value = parseInt(value));
                    setCount(value);
                }}
                min={1}
                max={25}
                step={1}
                style={{ width: 100 }}
            />
            <Button
                onClick={() => generate.mutate(count)}
            >
                Generate
            </Button>
        </Group>
    );
}

export default GenCount;