import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Checkbox from '@mui/material/Checkbox';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { type FunctionData } from '@/app/store';
import Tooltip from '@mui/material/Tooltip';
import { Typography } from '@mui/material';


interface VirtualizedListProps {
  title?: string,
  items: FunctionData[];
  onEdit?: (item: FunctionData) => void;
  onDelete?: (id: string | number | undefined) => void;
  onToggle?: (id: string | number| undefined) => void;
  onCreate?: () => void;
}

function renderRow({ items, onEdit, onDelete, onToggle }: VirtualizedListProps) {
  return function Row(props: ListChildComponentProps) {
    const { index, style } = props;
    const item = items[index];

    return (
      <ListItem 
        style={style} 
        key={item.id} 
        component="div" 
        divider
        disablePadding
        secondaryAction={
          <>
            <Tooltip title="Edit">
              <IconButton edge="end" aria-label="edit" onClick={() => onEdit?.(item)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton edge="end" aria-label="delete" onClick={() => onDelete?.(item.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Activate">
              <Checkbox checked={item.active} onChange={() => onToggle?.(item?.id)} />
            </Tooltip>
          </>
        }
      >
        <ListItemButton>
          <ListItemText sx={{ 
            '& .MuiTypography-root': {
                maxWidth: 'calc(100% - 120px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              } 
            }} 
            primary={item.name} 
          />
        </ListItemButton>
      </ListItem>
    );
  };
}

export default function VirtualizedList({ title, items, onEdit, onToggle, onDelete, onCreate }: VirtualizedListProps) {
  return (
    <Box
      sx={{ 
        width: '100%', 
        bgcolor: 'background.paper',
        '& .MuiListItemSecondaryAction-root': {
          display: 'flex',
          columnGap: '20px'
        },
        display: 'flex',
        borderRadius: '8px',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
      {title && (
        <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
          {title}
        </Typography>
      )}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => onCreate?.()}
        sx={{
          m: 1,
          alignSelf: 'flex-start'
        }}
      >
        Create
      </Button>
      </div>

      <Box sx={{ flex: 1 }}>
        <FixedSizeList
          height={350} // Reduced height to accommodate the Create button
          width={'100%'}
          itemSize={46}
          itemCount={items.length}
          overscanCount={5}
        >
          {renderRow({ items, onEdit, onDelete, onToggle })}
        </FixedSizeList>
      </Box>
    </Box>
  );
}